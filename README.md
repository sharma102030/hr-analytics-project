# Workforce Attrition Ledger — HR Analytics Project

A four-part HR analytics project built around one dataset (the well-known IBM HR Analytics
Attrition dataset, 1,470 employees) — because Deloitte's Human Capital practice cares about
exactly this kind of workforce analytics, and because a Data Analyst role typically expects
comfort across SQL, Python, a BI tool, and basic app-building, not just one of them.

| Part | What it is | Folder |
|---|---|---|
| **1. Full-stack dashboard** | MERN app: MongoDB aggregation pipelines, React + Recharts frontend | `backend/`, `frontend/` |
| **2. SQL analysis** | Normalized SQLite database + 9 queries (joins, window functions, CTEs) | `sql-analysis/` |
| **3. Python EDA & ML** | Jupyter notebook: EDA, correlation, chi-square tests, Logistic Regression + Random Forest | `python-analysis/` |
| **4. Power BI dashboard** | Ready-to-import dataset + step-by-step build guide with DAX measures | `powerbi/` |

All four work from the same underlying data, so the findings agree with each other — that
consistency across tools is itself worth pointing out in an interview.

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
└── powerbi/                     Power BI dashboard build kit
    ├── DASHBOARD_GUIDE.md
    └── data/hr_analytics_for_bi.csv
```

Each folder also has its own `README.md` with more detail — this file covers the whole project
and how to run the MERN app specifically.

---

## 2. Run the MERN app locally in VS Code

### Prerequisites
- Node.js 18+ and npm (`node -v` to check)
- A free MongoDB Atlas cluster (takes ~5 minutes, see below) — you don't need to install
  MongoDB on your machine.

### 2.1 Get a MongoDB connection string
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 cluster**.
3. Under **Database Access**, add a database user (username + password).
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere — fine for
   a personal project).
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

### 2.2 Backend
```bash
cd backend
npm install
cp .env.example .env
# open .env and paste your MongoDB connection string into MONGO_URI
# (add a database name at the end, e.g. .../hr_analytics)

npm run seed     # parses employees.csv and loads it into MongoDB (run once)
npm run dev      # starts the API on http://localhost:5000
```

### 2.3 Frontend
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

## 3. Running the other three parts

- **SQL**: `cd sql-analysis && python3 load_data.py` rebuilds `hr_analytics.db`; open it with
  the VS Code SQLite extension, DB Browser for SQLite, or the `sqlite3` CLI and run
  `queries.sql`. Full details in `sql-analysis/README.md`.
- **Python**: `cd python-analysis && pip install -r requirements.txt && jupyter notebook
  eda_and_modeling.ipynb`. The notebook ships pre-run with all outputs and plots already
  visible. Full details in `python-analysis/README.md`.
- **Power BI**: open `powerbi/DASHBOARD_GUIDE.md` and follow the steps, importing
  `powerbi/data/hr_analytics_for_bi.csv`. Takes about 30–45 minutes the first time.

---

## 4. How the MERN app's analytics work

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

## 5. Deploying the MERN app (Render)

**Backend (Web Service)**
1. Push this repo to GitHub.
2. On Render: New → Web Service → connect the repo, set **root directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variable `MONGO_URI` (same value as your local `.env`) and `CLIENT_ORIGIN`
   set to your deployed frontend URL once you have it.

**Frontend (Static Site)**
1. On Render: New → Static Site → same repo, **root directory** `frontend`.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Add environment variable `VITE_API_URL` = `https://your-backend.onrender.com/api`.

(SQL/Python/Power BI are local analysis artifacts — nothing to deploy there. If you want a
public link for the SQL/Python work, upload `eda_and_modeling.ipynb` to GitHub, which renders
notebooks with outputs automatically.)

---

## 6. Talking points for your interview

**Why four parts instead of one:** the JD asks for SQL, Python, and a BI tool specifically —
so this project demonstrates each one directly on the same dataset, instead of hoping one
full-stack app implies all of them. Framing it that way (rather than pretending it's all one
seamless pipeline) is the honest and, frankly, more impressive story.

**MERN app**
- Why MongoDB aggregation instead of pulling all rows and computing in JS: it scales to
  millions of rows without ever loading them into app memory, and it's the direct NoSQL
  equivalent of `GROUP BY`.
- Why `$bucket` for age/income: buckets need custom, uneven ranges (e.g. `<3k`, `3k-6k`) that a
  simple `$group` on the raw value can't express.
- Why the risk flag here is rule-based, not ML: transparent, no training data or model
  maintenance, weights drawn from the Key Drivers analysis, not guessed.
- Pagination + debounced search in the Employee Explorer: the search box waits 350ms after you
  stop typing before calling the API.

**SQL**
- Why 3 normalized tables instead of 1 flat table: so joins are real, not decorative. `job_roles`
  isn't nested under `departments` because the `Manager` role spans all three departments in
  this data — forcing a 1:1 mapping would have been wrong.
- `$bucket`-style logic reappears as `CASE WHEN` here — same idea, different engine.
- Window functions (`RANK() OVER`, `NTILE()`, running totals) do things a plain `GROUP BY`
  can't: compare a row to its own group average, split into quartiles, or accumulate a total —
  without a self-join or app-level loop.

**Python**
- Correlation only works on numeric columns; chi-square tests whether a categorical split
  (department, overtime, marital status) is statistically real or just noise (p < 0.05 cutoff).
- `class_weight='balanced'` matters because only ~16% of employees left — an unweighted model
  could hit ~84% accuracy by just predicting "stayed" for everyone and be useless.
- Random Forest had higher accuracy but noticeably lower recall on leavers than Logistic
  Regression in this run — a real trade-off, not a mistake, and a good one to be ready to
  explain: for retention, missing an at-risk employee costs more than a false alarm.

**Data cleaning (applies everywhere)**
- The raw CSV has constant columns (`EmployeeCount`, `Over18`, `StandardHours` — identical on
  every row) dropped as noise, and a UTF-8 BOM character on the first header that had to be
  stripped before parsing — small, but a real cleaning step worth mentioning if asked.

**Power BI**
- DAX measures (`Attrition Rate`, `Risk Score`) mirror the same logic used in the Node backend
  and the SQL query pack — same business rule, three different tools, same answer.
