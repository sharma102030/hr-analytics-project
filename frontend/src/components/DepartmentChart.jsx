import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import ChartPanel from './ChartPanel.jsx';
import { COLORS } from '../theme.js';

export default function DepartmentChart({ data, companyAvg }) {
  const top = [...data].sort((a, b) => b.attritionRate - a.attritionRate)[0];

  return (
    <ChartPanel
      title="Attrition rate by department"
      takeaway={top ? `${top.department} runs ${(top.attritionRate - companyAvg).toFixed(1)} points above the company average.` : ''}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.border} />
          <XAxis dataKey="department" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis unit="%" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value, name, props) => [`${value}%`, 'Attrition rate']}
            labelFormatter={(label, payload) =>
              payload?.[0] ? `${label} — ${payload[0].payload.left} of ${payload[0].payload.total} left` : label
            }
          />
          <ReferenceLine y={companyAvg} stroke={COLORS.teal} strokeDasharray="4 4" label={{ value: 'Company avg', position: 'insideTopRight', fontSize: 11, fill: COLORS.teal }} />
          <Bar dataKey="attritionRate" fill={COLORS.rust} radius={[3, 3, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
