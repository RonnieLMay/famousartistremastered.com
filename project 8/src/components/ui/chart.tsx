import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface ChartProps {
  data: Array<Record<string, any>>;
  type?: 'line' | 'area' | 'bar';
  xKey: string;
  yKey: string;
  height?: number;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({
  data,
  type = 'line',
  xKey,
  yKey,
  height = 350,
  className
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4287f5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4287f5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey={xKey} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke="#4287f5"
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey={xKey} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Bar dataKey={yKey} fill="#4287f5" />
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey={xKey} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#4287f5"
              strokeWidth={2}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;