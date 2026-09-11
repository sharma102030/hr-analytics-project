import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartPanel from './ChartPanel.jsx';
import { COLORS } from '../theme.js';

export default function AgeGroupChart({ data }) {
  return (
    <ChartPanel
      title="Attrition rate vs. headcount by age group"
      takeaway="Younger age brackets leave at a higher rate, but hold fewer people overall — worth weighing rate against volume."
    >
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={COLORS.border} />
          <XAxis dataKey="ageGroup" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis yAxisId="rate" unit="%" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="count" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="rate" dataKey="attritionRate" name="Attrition rate (%)" fill={COLORS.rust} radius={[3, 3, 0, 0]} maxBarSize={40} />
          <Line yAxisId="count" type="monotone" dataKey="total" name="Headcount" stroke={COLORS.teal} strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
