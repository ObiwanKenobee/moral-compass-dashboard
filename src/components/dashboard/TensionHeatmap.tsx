import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DECISIONS, DIMENSIONS } from "@/data/decisions";
import type { Decision } from "@/data/decisions";
import { X, Grid3X3 } from "lucide-react";

interface TensionHeatmapProps {
  selectedId: string;
  onSelect: (d: Decision) => void;
  timeframeIdx: number;
  onClose: () => void;
}

function cellColor(value: number): string {
  if (value >= 60) return "hsl(166 68% 44%)";
  if (value >= 30) return "hsl(166 60% 36%)";
  if (value >= 10) return "hsl(166 50% 28%)";
  if (value >= -10) return "hsl(220 20% 18%)";
  if (value >= -30) return "hsl(25 70% 28%)";
  if (value >= -60) return "hsl(4 60% 32%)";
  return "hsl(4 72% 40%)";
}

function cellTextColor(value: number): string {
  if (value >= 10) return "hsl(166 70% 80%)";
  if (value >= -10) return "hsl(215 20% 55%)";
  return "hsl(4 72% 75%)";
}

function netScore(dims: Record<string, number>): number {
  const vals = DIMENSIONS.map((d) => dims[d.key] ?? 0);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function netColor(v: number): string {
  if (v >= 20) return "hsl(var(--positive))";
  if (v >= -20) return "hsl(var(--dim-economy))";
  return "hsl(var(--negative))";
}

export function TensionHeatmap({ selectedId, onSelect, timeframeIdx, onClose }: TensionHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ decId: string; dimKey: string } | null>(null);
  const [heatmapTimeframe, setHeatmapTimeframe] = useState(timeframeIdx);

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden animate-float-up"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Grid3X3 size={14} className="text-primary" />
          <p className="font-mono text-xs tracking-widest uppercase text-primary">Portfolio Tension Heatmap</p>
          <span className="text-[10px] font-mono text-muted-foreground">· 6 dilemmas × 6 dimensions</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5">
            {["Immediate", "Short-Term", "Long-Term"].map((label, i) => (
              <button
                key={i}
                onClick={() => setHeatmapTimeframe(i)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                  heatmapTimeframe === i
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                T{i + 1}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-5 overflow-x-auto">
        {/* Legend */}
        <div className="flex items-center gap-6 mb-4 flex-wrap">
          <span className="text-[10px] font-mono text-muted-foreground">Click a row to switch dilemma</span>
          <div className="flex items-center gap-1.5">
            {[
              { color: "hsl(4 72% 40%)", label: "< −60" },
              { color: "hsl(4 60% 32%)", label: "−30" },
              { color: "hsl(25 70% 28%)", label: "−10" },
              { color: "hsl(220 20% 18%)", label: "0" },
              { color: "hsl(166 50% 28%)", label: "+10" },
              { color: "hsl(166 60% 36%)", label: "+30" },
              { color: "hsl(166 68% 44%)", label: "> +60" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-0.5">
                <div className="w-3.5 h-3.5 rounded-sm" style={{ background: item.color }} />
                <span className="text-[8px] font-mono text-muted-foreground/60">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-[640px]">
          {/* Column headers */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "220px repeat(6, 1fr) 60px" }}>
            <div /> {/* row label spacer */}
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="text-center">
                <div className="text-base">{dim.icon}</div>
                <div
                  className="text-[9px] font-mono truncate"
                  style={{ color: `hsl(var(--${dim.color}))` }}
                >
                  {dim.label.split(" ")[0]}
                </div>
              </div>
            ))}
            <div className="text-[9px] font-mono text-muted-foreground text-center leading-tight">Net<br />Avg</div>
          </div>

          {/* Rows */}
          {DECISIONS.map((dec) => {
            // Use the first timeframe if heatmapTimeframe is out of bounds for this decision
            const tfIdx = Math.min(heatmapTimeframe, dec.timeframes.length - 1);
            const tf = dec.timeframes[tfIdx];
            const net = netScore(tf.dimensions);
            const isSelected = dec.id === selectedId;

            return (
              <motion.div
                key={dec.id}
                className={`grid gap-1 mb-1 rounded-lg cursor-pointer transition-all ${
                  isSelected ? "ring-1 ring-primary/50" : "hover:ring-1 hover:ring-border"
                }`}
                style={{ gridTemplateColumns: "220px repeat(6, 1fr) 60px" }}
                onClick={() => onSelect(dec)}
                whileHover={{ scale: 1.005 }}
              >
                {/* Row label */}
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-l-md ${
                    isSelected ? "bg-primary/10" : "bg-muted/20"
                  }`}
                >
                  <div
                    className="w-1.5 h-full min-h-[28px] rounded-full shrink-0"
                    style={{ background: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))" }}
                  />
                  <div className="min-w-0">
                    <p className={`text-[11px] font-mono font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {dec.title.split(" ").slice(0, 4).join(" ")}
                    </p>
                    <p className="text-[9px] font-mono text-muted-foreground/60 truncate">{dec.region}</p>
                  </div>
                </div>

                {/* Dimension cells */}
                {DIMENSIONS.map((dim) => {
                  const val = tf.dimensions[dim.key] ?? 0;
                  const isHovered = hoveredCell?.decId === dec.id && hoveredCell?.dimKey === dim.key;
                  return (
                    <div
                      key={dim.key}
                      className="relative flex items-center justify-center rounded-sm py-1 transition-all duration-300"
                      style={{
                        background: cellColor(val),
                        transform: isHovered ? "scale(1.08)" : "scale(1)",
                        zIndex: isHovered ? 10 : 0,
                      }}
                      onMouseEnter={() => setHoveredCell({ decId: dec.id, dimKey: dim.key })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: cellTextColor(val) }}
                      >
                        {val > 0 ? "+" : ""}{val}
                      </span>

                      {/* Hover tooltip */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.92 }}
                            className="absolute bottom-full mb-1.5 z-20 pointer-events-none"
                            style={{ left: "50%", transform: "translateX(-50%)" }}
                          >
                            <div
                              className="rounded-lg px-2.5 py-2 text-center whitespace-nowrap"
                              style={{
                                background: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                boxShadow: "var(--shadow-card)",
                              }}
                            >
                              <p className="text-[10px] font-mono font-semibold text-foreground">
                                {dim.icon} {dim.label}
                              </p>
                              <p
                                className="text-xs font-mono font-bold"
                                style={{ color: cellTextColor(val) === "hsl(166 70% 80%)" ? "hsl(var(--positive))" : val < -10 ? "hsl(var(--negative))" : "hsl(var(--muted-foreground))" }}
                              >
                                {val > 0 ? "+" : ""}{val}
                              </p>
                              <p className="text-[9px] font-mono text-muted-foreground/60 mt-0.5 max-w-[120px] truncate">
                                {dec.title.split(" ").slice(0, 3).join(" ")}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Net score */}
                <div
                  className="flex items-center justify-center rounded-r-md py-1"
                  style={{ background: "hsl(var(--muted) / 0.4)" }}
                >
                  <span className="text-xs font-mono font-bold" style={{ color: netColor(net) }}>
                    {net > 0 ? "+" : ""}{net}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Column summary averages */}
        <div className="mt-3 pt-3 border-t border-border/40">
          <div className="grid gap-1" style={{ gridTemplateColumns: "220px repeat(6, 1fr) 60px" }}>
            <div className="text-[9px] font-mono text-muted-foreground/60 px-2 py-1 flex items-center">
              Avg across all
            </div>
            {DIMENSIONS.map((dim) => {
              const avg = Math.round(
                DECISIONS.reduce((sum, dec) => {
                  const tfIdx = Math.min(heatmapTimeframe, dec.timeframes.length - 1);
                  return sum + (dec.timeframes[tfIdx].dimensions[dim.key] ?? 0);
                }, 0) / DECISIONS.length
              );
              return (
                <div
                  key={dim.key}
                  className="flex items-center justify-center rounded-sm py-1"
                  style={{ background: cellColor(avg), opacity: 0.7 }}
                >
                  <span className="text-[9px] font-mono font-bold" style={{ color: cellTextColor(avg) }}>
                    {avg > 0 ? "+" : ""}{avg}
                  </span>
                </div>
              );
            })}
            <div />
          </div>
        </div>
      </div>
    </div>
  );
}
