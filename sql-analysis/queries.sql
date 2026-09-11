-- ============================================================================
-- HR Attrition Analytics — SQL query pack
-- Run against hr_analytics.db (built by load_data.py)
-- Each query is labelled with the SQL feature it's meant to demonstrate.
-- ============================================================================


-- 1. JOIN + GROUP BY — attrition rate by department
SELECT
    d.department_name,
    COUNT(*) AS total_employees,
    SUM(CASE WHEN e.attrition = 'Yes' THEN 1 ELSE 0 END) AS left_count,
    ROUND(100.0 * SUM(CASE WHEN e.attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_rate_pct
FROM employees e
JOIN departments d ON d.department_id = e.department_id
GROUP BY d.department_name
ORDER BY attrition_rate_pct DESC;


-- 2. Two JOINs — attrition rate by department + job role together
SELECT
    d.department_name,
    jr.job_role_name,
    COUNT(*) AS total_employees,
    SUM(CASE WHEN e.attrition = 'Yes' THEN 1 ELSE 0 END) AS left_count,
    ROUND(100.0 * SUM(CASE WHEN e.attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_rate_pct
FROM employees e
JOIN departments d ON d.department_id = e.department_id
JOIN job_roles jr ON jr.job_role_id = e.job_role_id
GROUP BY d.department_name, jr.job_role_name
HAVING COUNT(*) >= 10          -- ignore tiny role/department combos with < 10 people
ORDER BY attrition_rate_pct DESC;


-- 3. CASE WHEN bucketing — attrition rate by tenure band
SELECT
    CASE
        WHEN years_at_company < 2 THEN '0-1 yrs'
        WHEN years_at_company < 5 THEN '2-4 yrs'
        WHEN years_at_company < 10 THEN '5-9 yrs'
        ELSE '10+ yrs'
    END AS tenure_band,
    COUNT(*) AS total_employees,
    SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) AS left_count,
    ROUND(100.0 * SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_rate_pct
FROM employees
GROUP BY tenure_band
ORDER BY MIN(years_at_company);


-- 4. CASE WHEN bucketing — attrition rate by salary band
SELECT
    CASE
        WHEN monthly_income < 3000 THEN '<3k'
        WHEN monthly_income < 6000 THEN '3k-6k'
        WHEN monthly_income < 10000 THEN '6k-10k'
        WHEN monthly_income < 15000 THEN '10k-15k'
        ELSE '15k+'
    END AS salary_band,
    COUNT(*) AS total_employees,
    SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) AS left_count,
    ROUND(100.0 * SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_rate_pct
FROM employees
GROUP BY salary_band
ORDER BY MIN(monthly_income);


-- 5. Window function (RANK + AVG OVER) — how each employee's income compares
--    to their own department's average
SELECT
    e.employee_id,
    d.department_name,
    e.monthly_income,
    RANK() OVER (PARTITION BY d.department_name ORDER BY e.monthly_income DESC) AS income_rank_in_dept,
    ROUND(AVG(e.monthly_income) OVER (PARTITION BY d.department_name), 0) AS dept_avg_income,
    ROUND(e.monthly_income - AVG(e.monthly_income) OVER (PARTITION BY d.department_name), 0) AS diff_from_dept_avg
FROM employees e
JOIN departments d ON d.department_id = e.department_id
ORDER BY d.department_name, income_rank_in_dept
LIMIT 30;


-- 6. Window function (NTILE) — split everyone into income quartiles, then
--    check whether attrition is concentrated in the bottom quartile
WITH income_quartiles AS (
    SELECT
        employee_id,
        monthly_income,
        attrition,
        NTILE(4) OVER (ORDER BY monthly_income) AS income_quartile
    FROM employees
)
SELECT
    income_quartile,
    COUNT(*) AS total_employees,
    SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) AS left_count,
    ROUND(100.0 * SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_rate_pct
FROM income_quartiles
GROUP BY income_quartile
ORDER BY income_quartile;


-- 7. CTE chain — which departments sit above the company-wide attrition rate,
--    and by how many points
WITH company_avg AS (
    SELECT ROUND(100.0 * SUM(CASE WHEN attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS avg_rate
    FROM employees
),
dept_stats AS (
    SELECT
        d.department_name,
        COUNT(*) AS total_employees,
        SUM(CASE WHEN e.attrition = 'Yes' THEN 1 ELSE 0 END) AS left_count,
        ROUND(100.0 * SUM(CASE WHEN e.attrition = 'Yes' THEN 1 ELSE 0 END) / COUNT(*), 1) AS attrition_rate_pct
    FROM employees e
    JOIN departments d ON d.department_id = e.department_id
    GROUP BY d.department_name
)
SELECT
    ds.department_name,
    ds.total_employees,
    ds.left_count,
    ds.attrition_rate_pct,
    ca.avg_rate AS company_avg_rate,
    ROUND(ds.attrition_rate_pct - ca.avg_rate, 1) AS points_above_company_avg
FROM dept_stats ds
CROSS JOIN company_avg ca
WHERE ds.attrition_rate_pct > ca.avg_rate
ORDER BY points_above_company_avg DESC;


-- 8. CTE + multi-JOIN + conditional scoring — flag *current* employees who
--    look like a flight risk (same rule the Node backend uses in
--    utils/riskScore.js, expressed in pure SQL for the consulting-style
--    "who should HR talk to this week" deliverable)
WITH risk_flags AS (
    SELECT
        e.employee_id,
        d.department_name,
        jr.job_role_name,
        e.monthly_income,
        e.years_since_last_promotion,
        e.job_satisfaction,
        e.work_life_balance,
        e.over_time,
        (CASE WHEN e.over_time = 'Yes' THEN 1 ELSE 0 END)
      + (CASE WHEN e.years_since_last_promotion >= 3 THEN 1 ELSE 0 END)
      + (CASE WHEN e.job_satisfaction <= 2 THEN 1 ELSE 0 END)
      + (CASE WHEN e.work_life_balance <= 2 THEN 1 ELSE 0 END) AS risk_score
    FROM employees e
    JOIN departments d ON d.department_id = e.department_id
    JOIN job_roles jr ON jr.job_role_id = e.job_role_id
    WHERE e.attrition = 'No'          -- only flag people still employed
)
SELECT *
FROM risk_flags
WHERE risk_score >= 3
ORDER BY risk_score DESC, monthly_income ASC;


-- 9. Window function (running total) — cumulative count of leavers by tenure,
--    i.e. "by year N, how many leavers had we lost so far"
SELECT
    years_at_company,
    COUNT(*) AS leavers_at_this_tenure,
    SUM(COUNT(*)) OVER (ORDER BY years_at_company) AS cumulative_leavers
FROM employees
WHERE attrition = 'Yes'
GROUP BY years_at_company
ORDER BY years_at_company;
