
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  x: number;
  y: number;
  z: number;
  value: number;
  label: string;
}

interface Chart3DProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export default function Chart3D({ data, width = 400, height = 300 }: Chart3DProps) {
  // Transform the 3D data to work with recharts
  const chartData = data.map(point => ({
    name: point.label,
    value: point.value,
    x: point.x,
    y: point.y,
    z: point.z
  }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value: any, name: string) => [value, 'Value']}
            labelFormatter={(label) => `Item: ${label}`}
          />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
