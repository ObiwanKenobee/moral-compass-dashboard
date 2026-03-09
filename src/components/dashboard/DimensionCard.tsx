import type { Dimension } from "@/data/decisions";

interface DimensionCardProps {
  dimension: Dimension;
  value: number;
  compareValue?: number;
}

function getImpactLabel(value: number): string {
  if (value >= 70) return "Highly Beneficial";
  if (value >= 40) return "Moderately Positive";
  if (value >= 10) return "Slightly Positive";
  if (value >= -10) return "Negligible";
  if (value >= -40) return "Mildly Harmful";
  if (value >= -70) return "Significantly Harmful";
  return "Catastrophic";
}

function getBarColor(value: number): string {
  if (value >= 40) return "hsl(var(--positive))";
  if (value >= 0) return "hsl(var(--dim-economy))";
  if (value >= -40) return "hsl(25 90% 60%)";
  return "hsl(var(--negative))";
}

export function DimensionCard({ dimension, value, compareValue }: DimensionCardProps) {
  const absValue = Math.abs(value);
  const barWidth = absValue;
  const isPositive = value >= 0;
  const barColor = getBarColor(value);

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:border-secondary transition-colors duration-200"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{dimension.icon}</span>
          <span className="text-sm font-semibold text-foreground font-mono">{dimension.label}</span>
        </div>
        <span
          className="text-xs font-mono font-bold"
          style={{ color: barColor }}
        >
          {value > 0 ? "+" : ""}{value}
        </span>
      </div>

      {/* Centered bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 w-px h-full bg-border z-10" />
        {/* Bar */}
        <div
          className="absolute top-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${barWidth / 2}%`,
            left: isPositive ? "50%" : `calc(50% - ${barWidth / 2}%)`,
            background: barColor,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{getImpactLabel(value)}</span>
        {compareValue !== undefined && (
          <span className="text-[10px] font-mono" style={{ color: getBarColor(compareValue) }}>
            prev: {compareValue > 0 ? "+" : ""}{compareValue}
          </span>
        )}
      </div>
    </div>
  );
}
