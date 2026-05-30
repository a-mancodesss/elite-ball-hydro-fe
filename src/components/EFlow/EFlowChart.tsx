import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EFlowReading } from "../../types";

interface Props {
  readings: EFlowReading[];
}

export default function EFlowChart({ readings }: Props) {
  const data = readings.map((r) => ({
    date: r.date.slice(5),
    eflow: r.eflow_percent,
    compliant: r.compliant ? 1 : 0,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
          <YAxis
            domain={[0, "auto"]}
            unit="%"
            fontSize={11}
            stroke="#94a3b8"
            label={{
              value: "Release %",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
              fill: "#64748b",
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(v: any) => `${v}%`}
          />
          <ReferenceLine
            y={10}
            stroke="#dc2626"
            strokeDasharray="4 4"
            label={{
              value: "PS4 minimum (10%)",
              position: "insideTopRight",
              fill: "#dc2626",
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="eflow"
            name="Downstream release %"
            stroke="#0F4C81"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
