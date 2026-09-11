# SQL Analysis

A normalized SQLite database (3 tables, real foreign keys) built from the same HR dataset used
elsewhere in this project, plus a pack of 9 queries covering joins, window functions, and CTEs.

## Files
- `schema.sql` — table definitions (`departments`, `job_roles`, `employees`)
- `load_data.py` — reads `../backend/data/employees.csv` and builds `hr_analytics.db`
- `queries.sql` — the query pack
- `hr_analytics.db` — pre-built database (already loaded, ready to query)

## Running it
```bash
python3 load_data.py       # rebuilds hr_analytics.db from the CSV (only needed if you edit the schema)
```

To actually run the queries, use whichever you're comfortable with:
- **VS Code**: install the "SQLite Viewer" or "SQLite" extension, open `hr_analytics.db`,
  and run queries from `queries.sql` directly in the editor.
- **DB Browser for SQLite** (free GUI app): open `hr_analytics.db`, paste queries from
  `queries.sql` into the **Execute SQL** tab.
- **Command line**, if you have the `sqlite3` CLI installed: `sqlite3 hr_analytics.db` then
  `.read queries.sql`.

## Why a normalized schema instead of one flat table
`departments` and `job_roles` are separate lookup tables so the queries can demonstrate real
`JOIN`s. They aren't nested inside each other (e.g. `job_roles` doesn't have a
`department_id`) because in this dataset the `Manager` job role actually appears across all
three departments — a role-to-department mapping isn't 1:1, so forcing it would have been
incorrect, not just simpler.

## What each query demonstrates
| # | Query | SQL feature |
|---|---|---|
| 1 | Attrition rate by department | `JOIN` + `GROUP BY` |
| 2 | Attrition rate by department + job role | Two `JOIN`s + `HAVING` |
| 3 | Attrition rate by tenure band | `CASE WHEN` bucketing |
| 4 | Attrition rate by salary band | `CASE WHEN` bucketing |
| 5 | Income rank within department | Window function: `RANK()`, `AVG() OVER` |
| 6 | Attrition by income quartile | Window function: `NTILE()`, CTE |
| 7 | Departments above company average | CTE chain (two CTEs) |
| 8 | Flight-risk employees | CTE + multi-`JOIN` + conditional scoring |
| 9 | Cumulative leavers by tenure | Window function: running total |

All 9 were run against the dataset while building this — see the project README's interview
notes for the numbers each one returns.
