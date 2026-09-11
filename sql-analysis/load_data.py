"""
Builds hr_analytics.db (SQLite) from ../backend/data/employees.csv,
using the normalized schema in schema.sql.

Run with:  python3 load_data.py
"""
import csv
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).parent
CSV_PATH = BASE_DIR.parent / "backend" / "data" / "employees.csv"
DB_PATH = BASE_DIR / "hr_analytics.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def main():
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Create the schema
    cur.executescript(SCHEMA_PATH.read_text())

    # 2. Read the CSV (utf-8-sig strips the BOM on the first header automatically)
    with open(CSV_PATH, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    # 3. Populate lookup tables first, so employees can reference their IDs
    departments = sorted({r["Department"] for r in rows})
    job_roles = sorted({r["JobRole"] for r in rows})

    cur.executemany(
        "INSERT INTO departments (department_name) VALUES (?)",
        [(d,) for d in departments],
    )
    cur.executemany(
        "INSERT INTO job_roles (job_role_name) VALUES (?)",
        [(r,) for r in job_roles],
    )

    dept_id = {name: i + 1 for i, name in enumerate(departments)}
    role_id = {name: i + 1 for i, name in enumerate(job_roles)}

    # 4. Populate employees, translating text -> foreign keys
    employee_rows = [
        (
            int(r["EmployeeNumber"]),
            int(r["Age"]),
            r["Gender"],
            r["MaritalStatus"],
            int(r["Education"]),
            r["EducationField"],
            dept_id[r["Department"]],
            role_id[r["JobRole"]],
            int(r["MonthlyIncome"]),
            int(r["DistanceFromHome"]),
            int(r["NumCompaniesWorked"]),
            r["OverTime"],
            int(r["TotalWorkingYears"]),
            int(r["WorkLifeBalance"]),
            int(r["YearsAtCompany"]),
            int(r["YearsSinceLastPromotion"]),
            int(r["YearsWithCurrManager"]),
            int(r["JobSatisfaction"]),
            r["Attrition"],
        )
        for r in rows
    ]

    cur.executemany(
        """
        INSERT INTO employees (
            employee_id, age, gender, marital_status, education, education_field,
            department_id, job_role_id, monthly_income, distance_from_home,
            num_companies_worked, over_time, total_working_years, work_life_balance,
            years_at_company, years_since_last_promotion, years_with_curr_manager,
            job_satisfaction, attrition
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        employee_rows,
    )

    conn.commit()

    total = cur.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    print(f"Loaded {total} employees, {len(departments)} departments, {len(job_roles)} job roles into {DB_PATH.name}")

    conn.close()


if __name__ == "__main__":
    main()
