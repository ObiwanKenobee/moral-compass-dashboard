import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { DIMENSIONS } from "@/data/decisions";

interface TemporalComparisonProps {
  timeframes: { label: string; years: string; dimensions: Record<string, number> }[];
  dimensionKey: string;
  onDimensionChange: (key: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs font-mono shadow-card">
        <p className="text-foreground font-semibold">{label}</p>
        <p style={{ color: val >= 0 ? "hsl(var(--positive))" : "hsl(var(--negative))" }}>
          Impact: {val > 0 ? "+" : ""}{val}
        </p>
      </div>
    );
  }
  return null;
};

export function TemporalComparison({ timeframes, dimensionKey, onDimensionChange }: TemporalComparisonProps) {
  const activeDim = DIMENSIONS.find((d) => d.key === dimensionKey) ?? DIMENSIONS[0];

  const data = timeframes.map((tf) => ({
    name: tf.label,
    years: tf.years,
    value: tf.dimensions[dimensionKey] ?? 0,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Temporal Impact Trace
        </p>
        {/* Dimension picker */}
        <div className="flex flex-wrap gap-1.5">
          {DIMENSIONS.map((dim) => (
            <button
              key={dim.key}
              onClick={() => onDimensionChange(dim.key)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all duration-200 border ${
                dim.key === dimensionKey
                  ? "border-current text-foreground bg-secondary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={dim.key === dimensionKey ? { borderColor: dim.hexColor, color: dim.hexColor } : {}}
            >
              {dim.icon}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold mb-4" style={{ color: activeDim.hexColor }}>
        {activeDim.icon} {activeDim.label} — across time
      </p>

      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="35%">
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[-100, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
            {/* Zero line reference */}
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.value >= 40
                      ? "hsl(var(--positive))"
                      : entry.value >= 0
                      ? "hsl(var(--dim-economy))"
                      : entry.value >= -40
                      ? "hsl(25 90% 60%)"
                      : "hsl(var(--negative))"
                  }
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
