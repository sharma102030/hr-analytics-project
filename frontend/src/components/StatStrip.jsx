export default function StatStrip({ summary }) {
  if (!summary) return null;

  const avgMonthlyIncome = Number(summary.avgMonthlyIncome ?? 0);
  const avgAge = Number(summary.avgAge ?? 0);
  const avgYearsAtCompany = Number(summary.avgYearsAtCompany ?? 0);

  const stats = [
    { label: 'Total employees', value: summary.totalEmployees ?? 0 },
    { label: 'Average age', value: `${Number.isFinite(avgAge) ? avgAge : 0} yrs` },
    {
      label: 'Average monthly income',
      value: Number.isFinite(avgMonthlyIncome) ? `$${avgMonthlyIncome.toLocaleString()}` : 'N/A'
    },
    { label: 'Average tenure', value: `${Number.isFinite(avgYearsAtCompany) ? avgYearsAtCompany : 0} yrs` }
  ];

  return (
    <div className="stat-strip">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <div className="stat__value">{s.value}</div>
          <div className="stat__label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
