export default function HeroStat({ summary, departmentData, overtimeData }) {
  if (!summary) return null;

  const topDept = [...departmentData].sort((a, b) => b.attritionRate - a.attritionRate)[0];

  const overtimeYes = overtimeData.find((d) => d.overTime === 'Yes');
  const overtimeNo = overtimeData.find((d) => d.overTime === 'No');
  const overtimeMultiplier =
    overtimeYes && overtimeNo && overtimeNo.attritionRate > 0
      ? (overtimeYes.attritionRate / overtimeNo.attritionRate).toFixed(1)
      : null;

  return (
    <section className="hero">
      <div className="hero__number">{summary.attritionRate}%</div>
      <p className="hero__insight">
        <strong>{summary.attritionCount} of {summary.totalEmployees} employees</strong> left the
        company.
        {topDept && (
          <>
            {' '}
            <strong>{topDept.department}</strong> has the highest attrition rate at{' '}
            <strong>{topDept.attritionRate}%</strong>.
          </>
        )}
        {overtimeMultiplier && (
          <> Employees who work overtime leave at roughly <strong>{overtimeMultiplier}x</strong> the rate of those who don't.</>
        )}
      </p>
    </section>
  );
}
