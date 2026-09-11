import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartPanel from './ChartPanel.jsx';
import { COLORS } from '../theme.js';

export default function IncomeBandChart({ data }) {
  const highest = [...data].sort((a, b) => b.attritionRate - a.attritionRate)[0];

  return (
    <ChartPanel
      title="Attrition rate by monthly income"
      takeaway={highest ? `The ${highest.incomeBand}/month band sees the highest attrition, at ${highest.attritionRate}%.` : ''}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.border} />
          <XAxis dataKey="incomeBand" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis unit="%" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Attrition rate']}
            labelFormatter={(label, payload) =>
              payload?.[0] ? `Income ${label} — ${payload[0].payload.left} of ${payload[0].payload.total} left` : label
            }
          />
          <Bar dataKey="attritionRate" fill={COLORS.rust} radius={[3, 3, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
