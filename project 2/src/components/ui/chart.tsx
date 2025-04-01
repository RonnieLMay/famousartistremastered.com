import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  height?: number;
}

export function Chart({ data, height = 350 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-sm text-muted-foreground"
        />
        <YAxis
          className="text-sm text-muted-foreground"
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="value"
          className="fill-primary/10 stroke-primary"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}