# HR Attrition Analytics Platform

An end-to-end workforce analytics platform built on an HR dataset of **1,470 employees**. The project combines a React dashboard, Node.js/Express API, MongoDB aggregations, normalized SQL analysis, and Python-based statistical modeling to identify employee-attrition patterns and surface at-risk employee groups.

## Resume highlights

- Built a full-stack workforce analytics platform with **React, Node.js, Express, and MongoDB** to analyze attrition across departments, age groups, job roles, and income bands.
- Designed a normalized SQL schema and authored **9 analytical queries** using joins, CTEs, aggregations, conditional bucketing, and window functions.
- Performed exploratory data analysis, correlation analysis, and chi-square testing in Python to identify factors associated with attrition.
- Built and compared **Logistic Regression** and **Random Forest** models for employee attrition prediction and workforce-risk analysis.

## What the platform answers

- What is the overall attrition rate, and which departments have the highest rates?
- How does attrition vary by age group, job role, salary band, tenure, and overtime?
- Which employee characteristics are statistically associated with attrition?
- Which employees should be prioritized for retention outreach based on an explainable flight-risk score?
- Which predictive-model trade-offs matter when the goal is to avoid missing at-risk employees?

## Platform capabilities

| Area | Capability |
| --- | --- |
| Dashboard | Interactive summaries and charts for attrition by department, age group, income band, and overtime status. |
| Employee explorer | Paginated employee search with department filters and rule-based risk labels. |
| MongoDB analytics | Aggregation pipelines calculate dashboard metrics in the database instead of loading all records into application memory. |
| SQL analysis | A normalized SQLite database and a nine-query analysis pack demonstrate relational analytics techniques. |
| Python analysis | EDA, correlation analysis, chi-square tests, and comparative machine-learning baselines are documented in a pre-run notebook. |

## Tech stack

- **Frontend:** React, Vite, Recharts, Axios
- **Backend:** Node.js, Express, Mongoose, MongoDB, CORS, dotenv
- **SQL:** SQLite and Python `sqlite3`
- **Data science:** Python, Jupyter, pandas, NumPy, SciPy, scikit-learn, Matplotlib, Seaborn

## Architecture

```text
Employee CSV (1,470 records)
        |
        +--> MongoDB --> Express REST API --> React analytics dashboard
        |
        +--> Normalized SQLite schema --> 9 SQL analytical queries
        |
        +--> Python notebook --> EDA, statistical tests, ML model comparison
```

All three analysis paths use the same employee dataset, which keeps dashboard trends, SQL findings, and notebook results aligned.

## SQL analysis

The SQL module uses three normalized tables: `employees`, `departments`, and `job_roles`. It includes nine queries that cover the following business questions and techniques:

| # | Analysis | Techniques |
| --- | --- | --- |
| 1 | Attrition rate by department | `JOIN`, `GROUP BY`, aggregation |
| 2 | Attrition rate by department and job role | multiple `JOIN`s, `HAVING` |
| 3 | Attrition by tenure band | `CASE WHEN` bucketing |
| 4 | Attrition by income band | `CASE WHEN` bucketing |
| 5 | Income rank within department | `RANK()`, `AVG() OVER` |
| 6 | Attrition by income quartile | `NTILE()`, CTE |
| 7 | Departments above the company average | chained CTEs |
| 8 | Flight-risk employees | CTE, joins, conditional scoring |
| 9 | Cumulative leavers by tenure | running-total window function |

See [sql-analysis/README.md](sql-analysis/README.md) for setup details and [sql-analysis/queries.sql](sql-analysis/queries.sql) for the full query pack.

## Python EDA and modeling

The Jupyter notebook documents the complete analytical workflow:

1. Cleans the source data and removes constant, non-informative columns.
2. Explores attrition patterns using department, income, and overtime visualizations.
3. Measures numeric relationships through correlation analysis.
4. Tests categorical relationships with chi-square tests of independence.
5. Prepares a stratified train/test split and one-hot encoded features.
6. Trains and evaluates Logistic Regression and Random Forest classifiers.
7. Compares accuracy, recall, feature importance, coefficients, confusion matrices, and ROC curves.

Attrition is an imbalanced target (roughly 16% of employees left), so the models use class balancing and are assessed beyond accuracy alone. In retention use cases, recall is particularly important because failing to flag an employee likely to leave can be more costly than a false positive.

See [python-analysis/README.md](python-analysis/README.md) or open the pre-run [notebook](python-analysis/eda_and_modeling.ipynb).

## Project structure

```text
hr-analytics-project/
|-- backend/                 Express API, MongoDB models, controllers, seed script
|-- frontend/                React and Recharts dashboard
|-- sql-analysis/            SQLite schema, loader, database, and 9-query pack
|-- python-analysis/         EDA and machine-learning notebook
`-- README.md
```

## Run locally

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ for SQL rebuilding and the notebook
- MongoDB Atlas is optional. When `MONGO_URI` is absent, the backend uses an in-memory MongoDB instance.

### 1. Start the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then set `MONGO_URI` if you want to use MongoDB Atlas. The included development defaults are sufficient for local use without Atlas.

```bash
npm run dev
```

The API runs at `http://localhost:5000` and seeds the database automatically when it is empty. To reset a configured persistent MongoDB database from the source CSV, run `npm run seed`.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`, then run:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Run the analysis modules

```bash
# Rebuild and query the normalized SQLite database
cd sql-analysis
python load_data.py

# Open the EDA and modeling notebook
cd ../python-analysis
pip install -r requirements.txt
jupyter notebook eda_and_modeling.ipynb
```

## API endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | API health check |
| `GET /api/analytics/summary` | Headline workforce and attrition metrics |
| `GET /api/analytics/by-department` | Attrition by department |
| `GET /api/analytics/by-age-group` | Attrition by age band |
| `GET /api/analytics/by-income-band` | Attrition by income band |
| `GET /api/analytics/overtime-impact` | Overtime and attrition relationship |
| `GET /api/analytics/drivers` | Key-driver comparisons for leavers and stayers |
| `GET /api/employees` | Paginated, searchable employee data |
| `GET /api/employees/departments` | Available department filters |

## Dataset note

This project uses the IBM HR Analytics Attrition dataset for educational and portfolio purposes. The records are not real employee data; conclusions should be treated as analytical demonstrations, not HR policy recommendations.
