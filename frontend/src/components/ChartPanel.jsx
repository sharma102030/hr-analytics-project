export default function ChartPanel({ title, takeaway, children }) {
  return (
    <div className="panel">
      <p className="panel__title">{title}</p>
      {takeaway && <p className="panel__takeaway">{takeaway}</p>}
      {children}
    </div>
  );
}
