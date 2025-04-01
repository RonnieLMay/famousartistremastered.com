import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartProps {
  data: Array<Record<string, number | string>>;
  width?: number | string;
  height?: number | string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  xDataKey: string;
  yDataKey: string;
  stroke?: string;
}

const Chart: React.FC<ChartProps> = ({
  data,
  width = "100%",
  height = 400,
  margin = { top: 5, right: 30, left: 20, bottom: 5 },
  xDataKey,
  yDataKey,
  stroke = "#8884d8"
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart
        data={data}
        margin={margin}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yDataKey} stroke={stroke} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export { Chart };