-- HR Attrition Analytics — SQL schema
--
-- Normalized into 3 tables instead of one flat table, specifically so the
-- queries below can demonstrate real JOINs:
--   departments  — lookup table
--   job_roles    — lookup table (kept separate from departments: a role like
--                  "Manager" appears in multiple departments in this dataset,
--                  so it can't be nested under a single department_id)
--   employees    — the fact table, referencing both lookups by foreign key

DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS job_roles;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
    department_id   INTEGER PRIMARY KEY,
    department_name TEXT NOT NULL UNIQUE
);

CREATE TABLE job_roles (
    job_role_id   INTEGER PRIMARY KEY,
    job_role_name TEXT NOT NULL UNIQUE
);

CREATE TABLE employees (
    employee_id                INTEGER PRIMARY KEY,   -- original EmployeeNumber from the CSV
    age                        INTEGER,
    gender                     TEXT,
    marital_status             TEXT,
    education                  INTEGER,                -- 1 (Below College) .. 5 (Doctor)
    education_field            TEXT,
    department_id              INTEGER NOT NULL REFERENCES departments(department_id),
    job_role_id                INTEGER NOT NULL REFERENCES job_roles(job_role_id),
    monthly_income              INTEGER,
    distance_from_home          INTEGER,
    num_companies_worked        INTEGER,
    over_time                  TEXT,                    -- 'Yes' / 'No'
    total_working_years         INTEGER,
    work_life_balance           INTEGER,                -- 1 (Bad) .. 4 (Best)
    years_at_company            INTEGER,
    years_since_last_promotion  INTEGER,
    years_with_curr_manager     INTEGER,
    job_satisfaction            INTEGER,                -- 1 (Low) .. 4 (Very High)
    attrition                  TEXT NOT NULL             -- 'Yes' / 'No'
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_attrition  ON employees(attrition);
