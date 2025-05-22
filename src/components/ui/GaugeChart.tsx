
import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GaugeChartProps {
  value: number;
  size?: number;
  title?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  size = 250,
  title = "Percent",
}) => {
  const data = [{ name: title, value }];

  return (
    <div style={{ position: "relative", width: size, height: size }}>
    <ResponsiveContainer width="100%" >
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius="90%"
        outerRadius="120%"
        barSize={15}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        {/* trilho de fundo */}
        <RadialBar
          background
          dataKey="value"
          cornerRadius={15}
          fill="#e0e0e0"
        />
        {/* barra com degradê */}
        <defs>
          <linearGradient id="gradGauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b6bff1" stopOpacity={1} />
            <stop offset="100%" stopColor="#3d30f3" stopOpacity={1} />
          </linearGradient>
        </defs>
        <RadialBar dataKey="value" cornerRadius={15} fill="url(#gradGauge)" />

        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(31 41 55)",
            borderColor: "rgb(55 65 81)",
            borderRadius: "0.5rem",
            color: "rgb(243 244 246)",
            fontSize: "12px",
            padding: "8px",
          }}
          itemStyle={{ color: "rgb(243 244 246)" }}
        />
      </RadialBarChart>
    </ResponsiveContainer>

      {/* círculo de fundo */}
      {/* texto central */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {value}%
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
