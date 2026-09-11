export default function Recommendations({ summary, departmentData, overtimeData, driversData }) {
  const topDept = [...departmentData].sort((a, b) => b.attritionRate - a.attritionRate)[0];
  const overtimeYes = overtimeData.find((d) => d.overTime === 'Yes');
  const overtimeNo = overtimeData.find((d) => d.overTime === 'No');
  const incomeRow = driversData.find((d) => d.metric.includes('income'));
  const distanceRow = driversData.find((d) => d.metric.includes('distance'));
  const satisfactionRow = driversData.find((d) => d.metric.includes('satisfaction'));

  const items = [];

  if (topDept) {
    items.push(
      `Prioritize a retention review in ${topDept.department} — its ${topDept.attritionRate}% attrition rate is the highest of any department and disproportionately drives the company-wide number.`
    );
  }

  if (overtimeYes && overtimeNo) {
    items.push(
      `Audit overtime load. Employees working overtime leave at ${overtimeYes.attritionRate}% vs ${overtimeNo.attritionRate}% for those who don't — capping sustained overtime could meaningfully cut attrition.`
    );
  }

  if (incomeRow) {
    items.push(
      `Review compensation at the lower end. Employees who left earned $${incomeRow.left.toLocaleString()}/month on average, vs $${incomeRow.stayed.toLocaleString()} for those who stayed.`
    );
  }

  if (distanceRow) {
    items.push(
      `Consider hybrid or remote flexibility for long commutes. Leavers lived ${distanceRow.left}km from work on average vs ${distanceRow.stayed}km for those who stayed.`
    );
  }

  if (satisfactionRow) {
    items.push(
      `Watch job-satisfaction scores as an early signal — leavers averaged ${satisfactionRow.left}/4 vs ${satisfactionRow.stayed}/4 for employees who stayed.`
    );
  }

  if (items.length === 0) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <p className="section-heading">Suggested next steps</p>
      <p className="section-intro">Generated from the patterns above — a starting point for an HR action plan, not a final answer.</p>
      <ul className="recommendations">
        {items.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </section>
  );
}
