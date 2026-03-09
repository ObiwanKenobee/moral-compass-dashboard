import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DECISIONS, DIMENSIONS } from "@/data/decisions";
import type { Decision } from "@/data/decisions";
import { X, Compass } from "lucide-react";

interface MoralCompassProps {
  selectedId: string;
  onSelect: (d: Decision) => void;
  onClose: () => void;
}

// Compute average net impact across all timeframes
function avgNet(d: Decision): number {
  const nets = d.timeframes.map((tf) => {
    const vals = DIMENSIONS.map((dim) => tf.dimensions[dim.key] ?? 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  });
  return Math.round(nets.reduce((a, b) => a + b, 0) / nets.length);
}

// Chart constants
const W = 560;
const H = 380;
const PAD = { top: 40, right: 40, bottom: 50, left: 56 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

// Map reversibility (0–100) to x, net impact (-100–100) to y
function toX(irrev: number) {
  // reversibility = 100 - irreversibility
  const rev = 100 - irrev;
  return PAD.left + (rev / 100) * PLOT_W;
}

function toY(net: number) {
  return PAD.top + ((100 - net) / 200) * PLOT_H;
}

function netColor(v: number): string {
  if (v >= 20) return "hsl(var(--positive))";
  if (v >= -20) return "hsl(var(--dim-economy))";
  return "hsl(var(--negative))";
}

const QUADRANT_LABELS = [
  { x: PAD.left + PLOT_W * 0.75, y: PAD.top + PLOT_H * 0.15, label: "High Impact\n& Reversible", color: "hsl(var(--positive))" },
  { x: PAD.left + PLOT_W * 0.25, y: PAD.top + PLOT_H * 0.15, label: "High Impact\n& Irreversible", color: "hsl(var(--dim-economy))" },
  { x: PAD.left + PLOT_W * 0.75, y: PAD.top + PLOT_H * 0.85, label: "Low Impact\n& Reversible", color: "hsl(var(--muted-foreground))" },
  { x: PAD.left + PLOT_W * 0.25, y: PAD.top + PLOT_H * 0.85, label: "Catastrophic\n& Irreversible", color: "hsl(var(--negative))" },
];

const DECISION_EMOJIS: Record<string, string> = {
  hydrodam: "💧",
  nuclear: "☢️",
  "ai-surveillance": "👁",
  geoengineering: "🌍",
  ubi: "💰",
  "genetic-screening": "🧬",
};

export function MoralCompass({ selectedId, onSelect, onClose }: MoralCompassProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const points = DECISIONS.map((d) => ({
    d,
    x: toX(d.irreversibilityScore),
    y: toY(avgNet(d)),
    net: avgNet(d),
    emoji: DECISION_EMOJIS[d.id] ?? "⚖",
  }));

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden animate-float-up"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-primary" />
          <p className="font-mono text-xs tracking-widest uppercase text-primary">Moral Compass</p>
          <span className="text-[10px] font-mono text-muted-foreground">· All 6 dilemmas</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
          <X size={16} />
        </button>
      </div>

      <div className="p-5">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-[10px] font-mono text-muted-foreground">
          <span>X-axis: Reversibility (left=irreversible, right=reversible)</span>
          <span>Y-axis: Avg Net Impact (top=beneficial, bottom=harmful)</span>
        </div>

        {/* Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ minWidth: 320, aspectRatio: `${W}/${H}` }}
          >
            {/* Quadrant backgrounds */}
            <rect x={PAD.left} y={PAD.top} width={PLOT_W / 2} height={PLOT_H / 2}
              fill="hsl(var(--negative) / 0.04)" />
            <rect x={PAD.left + PLOT_W / 2} y={PAD.top} width={PLOT_W / 2} height={PLOT_H / 2}
              fill="hsl(var(--positive) / 0.04)" />
            <rect x={PAD.left} y={PAD.top + PLOT_H / 2} width={PLOT_W / 2} height={PLOT_H / 2}
              fill="hsl(var(--negative) / 0.02)" />
            <rect x={PAD.left + PLOT_W / 2} y={PAD.top + PLOT_H / 2} width={PLOT_W / 2} height={PLOT_H / 2}
              fill="hsl(var(--muted) / 0.1)" />

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const gx = PAD.left + (pct / 100) * PLOT_W;
              const gy = PAD.top + (pct / 100) * PLOT_H;
              return (
                <g key={pct}>
                  <line x1={gx} y1={PAD.top} x2={gx} y2={PAD.top + PLOT_H}
                    stroke="hsl(var(--border))" strokeWidth={0.6} opacity={0.4} />
                  <line x1={PAD.left} y1={gy} x2={PAD.left + PLOT_W} y2={gy}
                    stroke="hsl(var(--border))" strokeWidth={0.6} opacity={0.4} />
                </g>
              );
            })}

            {/* Axis lines (center = 0 on each axis) */}
            <line
              x1={PAD.left + PLOT_W / 2} y1={PAD.top}
              x2={PAD.left + PLOT_W / 2} y2={PAD.top + PLOT_H}
              stroke="hsl(var(--border))" strokeWidth={1.2} opacity={0.7}
            />
            <line
              x1={PAD.left} y1={PAD.top + PLOT_H / 2}
              x2={PAD.left + PLOT_W} y2={PAD.top + PLOT_H / 2}
              stroke="hsl(var(--border))" strokeWidth={1.2} opacity={0.7}
            />

            {/* Quadrant labels */}
            {QUADRANT_LABELS.map((q, i) => (
              q.label.split("\n").map((line, li) => (
                <text
                  key={`${i}-${li}`}
                  x={q.x}
                  y={q.y + li * 14}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fill={q.color}
                  opacity={0.5}
                >
                  {line}
                </text>
              ))
            ))}

            {/* Axis labels */}
            <text x={PAD.left} y={PAD.top - 10} fontSize={9} fontFamily="var(--font-mono)" fill="hsl(var(--negative))" opacity={0.7}>◀ Irreversible</text>
            <text x={PAD.left + PLOT_W} y={PAD.top - 10} fontSize={9} fontFamily="var(--font-mono)" fill="hsl(var(--positive))" textAnchor="end" opacity={0.7}>Reversible ▶</text>
            <text x={PAD.left - 8} y={PAD.top + 6} fontSize={9} fontFamily="var(--font-mono)" fill="hsl(var(--positive))" textAnchor="end" opacity={0.7}>+100</text>
            <text x={PAD.left - 8} y={PAD.top + PLOT_H / 2 + 4} fontSize={9} fontFamily="var(--font-mono)" fill="hsl(var(--muted-foreground))" textAnchor="end" opacity={0.7}>0</text>
            <text x={PAD.left - 8} y={PAD.top + PLOT_H} fontSize={9} fontFamily="var(--font-mono)" fill="hsl(var(--negative))" textAnchor="end" opacity={0.7}>-100</text>

            {/* Data points */}
            {points.map(({ d, x, y, net, emoji }) => {
              const isSelected = d.id === selectedId;
              const isHovered = hovered === d.id;
              const r = isSelected ? 22 : isHovered ? 20 : 16;

              return (
                <g key={d.id} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(d.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelect(d)}
                >
                  {/* Glow ring for selected */}
                  {isSelected && (
                    <circle cx={x} cy={y} r={r + 6}
                      fill="none"
                      stroke={netColor(net)}
                      strokeWidth={1.5}
                      opacity={0.4}
                    />
                  )}
                  {/* Main circle */}
                  <circle
                    cx={x} cy={y} r={r}
                    fill={isSelected ? `${netColor(net).replace(")", " / 0.25)")}` : "hsl(var(--card))"}
                    stroke={netColor(net)}
                    strokeWidth={isSelected ? 2 : 1.2}
                    opacity={isSelected || isHovered ? 1 : 0.75}
                  />
                  {/* Emoji */}
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={isSelected ? 13 : 11}>
                    {emoji}
                  </text>

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <foreignObject
                        x={x - 80}
                        y={y < PAD.top + 80 ? y + r + 6 : y - r - 70}
                        width={160}
                        height={64}
                      >
                        <div
                          style={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            padding: "6px 10px",
                          }}
                        >
                          <p style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 600, color: "hsl(var(--foreground))", margin: 0 }}>
                            {d.title}
                          </p>
                          <p style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))", margin: "2px 0 0 0" }}>
                            Avg Net: <span style={{ color: netColor(net) }}>{net > 0 ? "+" : ""}{net}</span>
                            {"  "}Irrev: {d.irreversibilityScore}
                          </p>
                        </div>
                      </foreignObject>
                    )}
                  </AnimatePresence>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {points.map(({ d, net }) => (
            <button
              key={d.id}
              onClick={() => onSelect(d)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono border transition-all ${
                d.id === selectedId
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-secondary"
              }`}
            >
              <span>{DECISION_EMOJIS[d.id]}</span>
              <span className="truncate max-w-[100px]">{d.title.split(" ").slice(0, 3).join(" ")}</span>
              <span style={{ color: netColor(net) }}>{net > 0 ? "+" : ""}{net}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
