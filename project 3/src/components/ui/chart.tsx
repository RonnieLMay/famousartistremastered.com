import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
  width?: number | string;
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ data, width = '100%', height = 300 }) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="name"
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
        />
        <YAxis
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#4F46E5"
          strokeWidth={2}
          dot={{ fill: '#4F46E5' }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;