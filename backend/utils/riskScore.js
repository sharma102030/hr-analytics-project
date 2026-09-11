// A simple, rule-based "flight risk" score.
//
// This is deliberately NOT a machine learning model — it's the kind of
// heuristic scorecard an HR analytics team would build first, before
// investing in a predictive model. Every point added below is a factor
// that the "Key Drivers" analysis on the dashboard shows is genuinely
// linked to attrition in this dataset, so the score stays easy to explain:
// "this employee is flagged because they work overtime, haven't been
// promoted in 3+ years, and report low job satisfaction."
function calculateRiskScore(employee) {
  let score = 0;

  if (employee.overTime === 'Yes') score += 2;
  if (employee.yearsSinceLastPromotion >= 3) score += 1;
  if (employee.jobSatisfaction <= 2) score += 1;
  if (employee.workLifeBalance <= 2) score += 1;
  if (employee.yearsAtCompany <= 2) score += 1;
  if (employee.numCompaniesWorked >= 4) score += 1;

  let level = 'Low';
  if (score >= 4) level = 'High';
  else if (score >= 2) level = 'Medium';

  return { score, level };
}

module.exports = { calculateRiskScore };
