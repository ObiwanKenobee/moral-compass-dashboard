import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DIMENSIONS } from "@/data/decisions";

interface ImpactRadarProps {
  dimensions: Record<string, number>;
  compareData?: { label: string; dimensions: Record<string, number> } | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const subject = payload[0]?.payload?.subject;
    const dim = DIMENSIONS.find((d) => d.label === subject);
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-card text-xs font-mono">
        <p className="text-foreground font-semibold mb-1">{dim?.icon} {subject}</p>
        {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value > 0 ? "+" : ""}{entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomPolarAngleAxis = ({ payload, x, y, cx, cy, ...rest }: any) => {
  const dim = DIMENSIONS.find((d) => d.label === payload.value);
  return (
    <g>
      <text
        {...rest}
        x={x}
        y={y}
        cx={cx}
        cy={cy}
        textAnchor={x > cx ? "start" : x < cx ? "end" : "middle"}
        fill={dim ? `hsl(var(--${dim.color}))` : "#888"}
        fontSize={11}
        fontFamily="var(--font-mono)"
      >
        {dim?.icon} {payload.value}
      </text>
    </g>
  );
};

export function ImpactRadar({ dimensions, compareData }: ImpactRadarProps) {
  const data = DIMENSIONS.map((dim) => ({
    subject: dim.label,
    value: dimensions[dim.key] ?? 0,
    compare: compareData?.dimensions[dim.key] ?? undefined,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[360px] relative">
      {/* Glow orb behind chart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-48 h-48 rounded-full animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, hsl(43 95% 62% / 0.06) 0%, transparent 70%)",
          }}
        />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid
            gridType="polygon"
            stroke="hsl(218 22% 20%)"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={<CustomPolarAngleAxis />}
          />
          {compareData && (
            <Radar
              name={compareData.label}
              dataKey="compare"
              stroke="hsl(210 85% 62% / 0.5)"
              fill="hsl(210 85% 62% / 0.08)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          )}
          <Radar
            name="Current Timeframe"
            dataKey="value"
            stroke="hsl(43 95% 62%)"
            fill="hsl(43 95% 62% / 0.12)"
            strokeWidth={2}
            dot={{ fill: "hsl(43 95% 62%)", r: 4, strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
