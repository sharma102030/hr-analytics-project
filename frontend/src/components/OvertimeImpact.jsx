import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartPanel from './ChartPanel.jsx';
import { COLORS } from '../theme.js';

export default function OvertimeImpact({ data }) {
  const shaped = data
    .map((d) => ({ ...d, label: d.overTime === 'Yes' ? 'Works overtime' : 'No overtime' }))
    .sort((a, b) => (a.overTime === 'Yes' ? -1 : 1));

  return (
    <ChartPanel
      title="Does overtime predict attrition?"
      takeaway="Overtime is the single strongest single-factor split in this dataset."
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={shaped} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={COLORS.border} />
          <XAxis type="number" unit="%" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 13 }} tickLine={false} axisLine={false} width={110} />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Attrition rate']}
            labelFormatter={(label, payload) =>
              payload?.[0] ? `${label} (${payload[0].payload.left} of ${payload[0].payload.total})` : label
            }
          />
          <Bar dataKey="attritionRate" radius={[0, 3, 3, 0]} maxBarSize={36}>
            {shaped.map((entry) => (
              <Cell key={entry.overTime} fill={entry.overTime === 'Yes' ? COLORS.rust : COLORS.teal} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
