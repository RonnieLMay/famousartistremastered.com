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

interface ChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  width?: number | string;
  height?: number;
}

const Chart: React.FC<ChartProps> = ({ data, width = '100%', height = 300 }) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;