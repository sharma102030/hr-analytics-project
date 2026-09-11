# Python EDA, Statistical Tests & Predictive Modeling

A Jupyter notebook covering exploratory data analysis, correlation and chi-square significance
testing, and two baseline ML models (Logistic Regression + Random Forest) to predict attrition —
on the same dataset used in the SQL and dashboard parts of this project. The notebook ships
**pre-run**, so you can open it and see every output/plot immediately, then re-run cells
yourself to learn it.

## Running it
```bash
pip install -r requirements.txt
jupyter notebook eda_and_modeling.ipynb
```

## What's inside
1. **Load & clean** — drops constant columns (`EmployeeCount`, `Over18`, `StandardHours`),
   confirms there are no missing values.
2. **EDA** — attrition rate by department, income distribution by attrition, overtime impact,
   with matplotlib/seaborn charts.
3. **Statistical tests**
   - Correlation of every numeric feature against attrition (encoded 0/1).
   - Chi-square test of independence for categorical features (`Department`, `OverTime`,
     `MaritalStatus`, etc.) — tells you which categorical splits are statistically significant
     (p < 0.05) rather than just eyeballing a percentage difference.
4. **Feature preparation** — one-hot encoding, train/test split with `stratify=y` (attrition is
   imbalanced: ~16% of employees left).
5. **Model 1: Logistic Regression** — scaled features, `class_weight='balanced'`, confusion
   matrix, and the top 15 coefficients by magnitude (interpretability).
6. **Model 2: Random Forest** — same target, no scaling needed, feature importances, ROC curve
   comparison against Logistic Regression.
7. **Summary** — the four independent methods (correlation, chi-square, LR coefficients, RF
   importances) converge on the same top drivers: overtime, income, tenure, marital status.

## A genuine finding worth knowing before your interview
Random Forest came back with **higher raw accuracy but noticeably lower recall** on the "Left"
class than Logistic Regression. That's a real result from this run, not a mistake — tree
models with default thresholds tend to be conservative about the minority class even with
balanced class weights. Since missing an at-risk employee is costlier than a false alarm for
this business problem, that's a legitimate reason to prefer the Logistic Regression model (or
tune the Random Forest's classification threshold) instead of just picking the model with the
higher accuracy number. This is exactly the kind of nuance that's good to be able to explain if
asked "which model is better and why."
