# Workforce Attrition Ledger — HR Analytics Project

A three-part HR analytics project built around the IBM HR Analytics Attrition dataset
(1,470 employees). It combines a full-stack dashboard, SQL analysis, and Python analysis.

| Part | What it is | Folder |
|---|---|---|
| **1. Full-stack dashboard** | MERN app: MongoDB aggregation pipelines, React + Recharts frontend | `backend/`, `frontend/` |
| **2. SQL analysis** | Normalized SQLite database + 9 queries (joins, window functions, CTEs) | `sql-analysis/` |
| **3. Python EDA & ML** | Jupyter notebook: EDA, correlation, chi-square tests, Logistic Regression + Random Forest | `python-analysis/` |
All three work from the same underlying data, so the findings agree with each other — that
consistency across tools is itself worth pointing out in an interview.

## Tech stack

- **Frontend:** React, Vite, Recharts, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, CORS, dotenv
- **SQL analysis:** SQLite and Python's built-in `sqlite3` module
- **Python analysis:** Python, Jupyter, pandas, NumPy, SciPy, scikit-learn, Matplotlib, Seaborn

---

## 1. Project structure

```
hr-analytics-project/
├── backend/                    MERN backend (Node/Express/MongoDB)
│   ├── server.js               Express app entry point
│   ├── config/db.js            MongoDB connection
│   ├── models/Employee.js      Mongoose schema
│   ├── controllers/            Route handlers (aggregation pipelines live here)
│   ├── routes/                 Express routers
│   ├── seed/seedDatabase.js    Loads data/employees.csv into MongoDB
│   ├── utils/riskScore.js      Rule-based "flight risk" scoring
│   └── data/employees.csv      The dataset
├── frontend/                   MERN frontend (React + Vite + Recharts)
│   ├── index.html
│   └── src/
│       ├── App.jsx             Fetches data, lays out the dashboard
│       ├── api/client.js       Axios instance
│       ├── theme.js            Shared chart colors
│       └── components/         One file per dashboard section
├── sql-analysis/                Normalized SQLite DB + query pack
│   ├── schema.sql
│   ├── load_data.py
│   ├── queries.sql
│   └── hr_analytics.db
├── python-analysis/             EDA, stats tests, ML models
│   ├── eda_and_modeling.ipynb   (ships pre-run, with outputs/plots)
│   ├── requirements.txt
│   └── data/employees.csv
```

This file covers the complete project and how to run the dashboard locally.

---

## Run the dashboard locally

### Prerequisites
- Node.js 18+ and npm (`node -v` to check)
- MongoDB Atlas, or no database setup: the backend automatically uses an in-memory MongoDB
  server when `MONGO_URI` is not configured.

### Optional: configure MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 cluster**.
3. Under **Database Access**, add a database user (username + password).
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere — fine for
   a personal project).
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your MongoDB connection string to MONGO_URI when using MongoDB Atlas.

npm run seed     # parses employees.csv and loads it into MongoDB (run once)
npm run dev      # starts the API on http://localhost:5000
```

### Frontend
Open a **second terminal**:
```bash
cd frontend
npm install
cp .env.example .env    # already points at http://localhost:5000/api, no changes needed
npm run dev              # starts on http://localhost:5173
```
Open http://localhost:5173 in your browser. The dashboard fetches everything from your
local backend.

---

## Run the analysis projects

- **SQL**: `cd sql-analysis && python3 load_data.py` rebuilds `hr_analytics.db`; open it with
  the VS Code SQLite extension, DB Browser for SQLite, or the `sqlite3` CLI and run
  `queries.sql`. Full details in `sql-analysis/README.md`.
- **Python**: `cd python-analysis && pip install -r requirements.txt && jupyter notebook
  eda_and_modeling.ipynb`. The notebook ships pre-run with all outputs and plots already
  visible. Full details in `python-analysis/README.md`.
---

## How the dashboard works

- **Aggregation, not app-level loops.** Every chart is powered by a MongoDB aggregation
  pipeline (`$group`, `$bucket`, `$project`) in `controllers/analyticsController.js` — this is
  the same idea as `SELECT ... GROUP BY` in SQL, just expressed as pipeline stages. The
  database does the counting, not a `for` loop in Node.
- **Risk scoring is a rule, not a model** in this layer. `utils/riskScore.js` adds points for
  overtime, a long promotion gap, low satisfaction, and poor work-life balance, then buckets
  the score into Low/Medium/High. (The Python layer adds an actual trained model on top of
  this — see `python-analysis/`.)
- **The dashboard tells you *why*, not just *what*.** The "Key Drivers" section compares
  average values (income, tenure, distance from home, satisfaction) between employees who left
  and those who stayed, so every chart takeaway sentence you see is computed from the live
  data, not hardcoded.

---

## Technical notes

**Dashboard**
- MongoDB aggregation is used instead of pulling all rows into JavaScript:
  millions of rows without ever loading them into app memory, and it's the direct NoSQL
  equivalent of `GROUP BY`.
- Why `$bucket` for age/income: buckets need custom, uneven ranges (e.g. `<3k`, `3k-6k`) that a
  simple `$group` on the raw value can't express.
- Why the risk flag here is rule-based, not ML: transparent, no training data or model
  maintenance, weights drawn from the Key Drivers analysis, not guessed.
- Pagination + debounced search in the Employee Explorer: the search box waits 350ms after you
  stop typing before calling the API.

**SQL analysis**
- Why 3 normalized tables instead of 1 flat table: so joins are real, not decorative. `job_roles`
  isn't nested under `departments` because the `Manager` role spans all three departments in
  this data — forcing a 1:1 mapping would have been wrong.
- `$bucket`-style logic reappears as `CASE WHEN` here — same idea, different engine.
- Window functions (`RANK() OVER`, `NTILE()`, running totals) do things a plain `GROUP BY`
  can't: compare a row to its own group average, split into quartiles, or accumulate a total —
  without a self-join or app-level loop.

**Python analysis**
- Correlation only works on numeric columns; chi-square tests whether a categorical split
  (department, overtime, marital status) is statistically real or just noise (p < 0.05 cutoff).
- `class_weight='balanced'` matters because only ~16% of employees left — an unweighted model
  could hit ~84% accuracy by just predicting "stayed" for everyone and be useless.
- Random Forest had higher accuracy but noticeably lower recall on leavers than Logistic
  Regression in this run — a real trade-off, not a mistake, and a good one to be ready to
  explain: for retention, missing an at-risk employee costs more than a false alarm.

**Data cleaning**
- The raw CSV has constant columns (`EmployeeCount`, `Over18`, `StandardHours` — identical on
  every row) dropped as noise, and a UTF-8 BOM character on the first header that had to be
  stripped before parsing — small, but a real cleaning step worth mentioning if asked.

