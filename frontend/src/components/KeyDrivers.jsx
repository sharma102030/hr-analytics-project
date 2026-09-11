export default function KeyDrivers({ data }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <p className="section-heading">What sets leavers apart</p>
      <p className="section-intro">
        Average value of each factor for employees who stayed vs. employees who left. Bars are
        scaled per row so the gap is easy to read at a glance.
      </p>

      <div className="driver-legend">
        <span><span className="legend-dot" style={{ background: 'var(--color-teal)' }} />Stayed</span>
        <span><span className="legend-dot" style={{ background: 'var(--color-rust)' }} />Left</span>
      </div>

      <div className="panel">
        {data.map((row) => {
          const max = Math.max(row.stayed, row.left) || 1;
          const stayedPct = (row.stayed / max) * 100;
          const leftPct = (row.left / max) * 100;
          const diffPct = row.stayed === 0 ? 0 : (((row.left - row.stayed) / row.stayed) * 100).toFixed(0);

          return (
            <div className="driver-row" key={row.metric}>
              <div className="driver-row__label">
                <span>{row.metric}</span>
                <span>
                  {row.stayed} vs {row.left}
                  {diffPct !== '0' && (
                    <span className="driver-row__delta"> ({diffPct > 0 ? '+' : ''}{diffPct}%)</span>
                  )}
                </span>
              </div>
              <div className="driver-bars">
                <div className="driver-bar-track">
                  <div className="driver-bar-fill driver-bar-fill--stayed" style={{ width: `${stayedPct}%` }} />
                </div>
                <div className="driver-bar-track">
                  <div className="driver-bar-fill driver-bar-fill--left" style={{ width: `${leftPct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
