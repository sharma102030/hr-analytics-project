# Power BI Dashboard — Build Guide

I can't generate a working `.pbix` file directly (Power BI's file format needs Power BI
Desktop itself to create), so instead: here's a ready-to-import dataset and an exact,
copy-pasteable set of steps to build the dashboard yourself in about 30–45 minutes. Power BI
Desktop is free — [download it here](https://www.microsoft.com/en-us/power-platform/products/power-bi/desktop).

The data in `data/hr_analytics_for_bi.csv` already has `TenureBand`, `IncomeBand`, `AgeGroup`,
and `RiskLevel` columns pre-computed, so you can build visuals immediately — Step 5 below also
shows how to build the same `RiskLevel` column natively in DAX, which is worth doing once so
you can speak to it in an interview.

---

## 1. Import the data
1. Open Power BI Desktop → **Get Data → Text/CSV**.
2. Select `data/hr_analytics_for_bi.csv` → **Load**.
3. In the **Data** pane on the right, confirm columns like `MonthlyIncome`, `Age`,
   `YearsAtCompany` are typed as *Whole Number* (Power BI usually gets this right
   automatically; fix any that import as Text via **Column tools → Data type**).

## 2. Create the core measures (Modeling tab → New Measure)
Paste these one at a time:

```dax
Total Employees = COUNTROWS('hr_analytics_for_bi')

Attrition Count = CALCULATE([Total Employees], 'hr_analytics_for_bi'[Attrition] = "Yes")

Attrition Rate = DIVIDE([Attrition Count], [Total Employees], 0)

Avg Monthly Income = AVERAGE('hr_analytics_for_bi'[MonthlyIncome])

Avg Tenure (Years) = AVERAGE('hr_analytics_for_bi'[YearsAtCompany])

Avg Age = AVERAGE('hr_analytics_for_bi'[Age])
```

Format `Attrition Rate` as a percentage (right-click the measure → **Format: Percentage**,
1 decimal place).

## 3. Build the KPI cards (top row)
Add four **Card** visuals for `Total Employees`, `Attrition Rate`, `Avg Monthly Income`,
`Avg Tenure (Years)`. Arrange them in a row across the top of the page.

## 4. Build the charts
| Visual type | Axis / Legend | Value | What it shows |
|---|---|---|---|
| Clustered bar chart | `Department` | `Attrition Rate` | attrition by department |
| Clustered bar chart | `OverTime` | `Attrition Rate` | overtime impact |
| Clustered column chart | `IncomeBand` | `Attrition Rate` | attrition by salary band |
| Line and clustered column chart | `AgeGroup` | Column = `Total Employees`, Line = `Attrition Rate` | rate vs. headcount by age |

For each chart, sort the axis logically (right-click the visual → **Sort by** → the band
column, or manually reorder `IncomeBand`/`AgeGroup`/`TenureBand` as an ordered categorical if
Power BI sorts them alphabetically instead of numerically — **Column tools → Sort by column**
is the fix if that happens).

## 5. (Optional but worth doing) Build `RiskLevel` natively in DAX
The CSV already has `RiskLevel`, but recreating it as a calculated column shows you understand
DAX, not just CSV importing:

```dax
Risk Score =
VAR OT = IF('hr_analytics_for_bi'[OverTime] = "Yes", 2, 0)
VAR Promo = IF('hr_analytics_for_bi'[YearsSinceLastPromotion] >= 3, 1, 0)
VAR Satisfaction = IF('hr_analytics_for_bi'[JobSatisfaction] <= 2, 1, 0)
VAR WLB = IF('hr_analytics_for_bi'[WorkLifeBalance] <= 2, 1, 0)
VAR Tenure = IF('hr_analytics_for_bi'[YearsAtCompany] <= 2, 1, 0)
VAR Companies = IF('hr_analytics_for_bi'[NumCompaniesWorked] >= 4, 1, 0)
RETURN OT + Promo + Satisfaction + WLB + Tenure + Companies

Risk Level =
SWITCH(
    TRUE(),
    'hr_analytics_for_bi'[Risk Score] >= 4, "High",
    'hr_analytics_for_bi'[Risk Score] >= 2, "Medium",
    "Low"
)
```

## 6. Employee explorer table
Add a **Table** visual with `EmployeeNumber`, `Department`, `JobRole`, `Age`,
`MonthlyIncome`, `YearsAtCompany`, `OverTime`, `RiskLevel`. Add slicers for `Department` and
`RiskLevel` above it so it behaves like the Employee Explorer in the web dashboard.

## 7. Key drivers table
Add a **Matrix** visual: Rows = a disconnected table of metric names (or just build 4 small
Card visuals side by side), Values = `Avg Monthly Income`, `Avg Tenure (Years)` etc., split by
`Attrition` in the Legend/Columns field — this reproduces the "stayed vs left" comparison from
the other parts of the project.

## 8. Polish
- Page background: light grey (`#EEF1EE`) to match the rest of the project.
- Use one consistent color for "Left"/at-risk visuals (`#A8462B`) and one for "Stayed"/healthy
  (`#2F6F62`) throughout — **Format → Data colors**.
- Add a text box title: "Workforce Attrition Ledger."
- **File → Export → PDF** (or **Publish** if you have a Power BI account) to share it without
  needing the recruiter to open Power BI Desktop.

---

## Tableau equivalent (if you'd rather use Tableau Public — also free)
The concepts map directly:
- Same CSV as the data source.
- DAX measures above → **Calculated Fields** (Tableau's formula language is similar:
  `SUM(IF [Attrition] = "Yes" THEN 1 ELSE 0 END) / COUNT([EmployeeNumber])` for attrition rate).
- Power BI "visuals" → Tableau **Sheets**, combined into a **Dashboard**.
- Slicers → Tableau **Filters** dragged onto the dashboard.
