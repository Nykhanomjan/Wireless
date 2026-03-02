"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SensorData {
  time: string;
  x: number;
  y: number;
  z: number;
}

interface SensorChartProps {
  data: SensorData[];
}

export default function SensorChart({ data }: SensorChartProps) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 h-[400px]">
      <h3 className="text-lg font-semibold text-slate-600 mb-4">
        Live Accelerometer Data
      </h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#888"
              fontSize={12}
              tick={{ fill: "#888" }}
            />
            <YAxis domain={[-20, 20]} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="x"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Acc X"
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Acc Y"
            />
            <Line
              type="monotone"
              dataKey="z"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Acc Z"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
