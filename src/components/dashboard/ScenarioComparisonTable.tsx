import { useState } from "react";
import { DIMENSIONS } from "@/data/decisions";
import type { SavedScenario } from "./SavedScenarios";
import { X, TableIcon, Minus, Plus, ArrowRight } from "lucide-react";

interface ScenarioComparisonTableProps {
  scenarios: SavedScenario[];
  onClose: () => void;
}

function deltaColor(v: number): string {
  if (v > 20) return "hsl(var(--positive))";
  if (v > 0) return "hsl(166 68% 48% / 0.8)";
  if (v === 0) return "hsl(var(--muted-foreground))";
  if (v > -20) return "hsl(25 90% 60%)";
  return "hsl(var(--negative))";
}

function netColor(v: number): string {
  if (v >= 20) return "hsl(var(--positive))";
  if (v >= -20) return "hsl(var(--dim-economy))";
  return "hsl(var(--negative))";
}

function netImpact(dims: Record<string, number>, weights?: Record<string, number>): number {
  let sum = 0, total = 0;
  DIMENSIONS.forEach((d) => {
    const w = weights ? (weights[d.key] ?? 1) : 1;
    sum += (dims[d.key] ?? 0) * w;
    total += w;
  });
  return total > 0 ? Math.round(sum / total) : 0;
}

function DeltaCell({ value, base }: { value: number; base?: number }) {
  // For whatif: show delta vs base. For weights or no base: show value
  const delta = base !== undefined ? value - base : value;
  const color = deltaColor(delta);
  return (
    <td className="px-3 py-2 text-center">
      <span
        className="inline-flex items-center justify-center gap-0.5 text-[11px] font-mono font-bold"
        style={{ color }}
      >
        {delta > 0 ? <Plus size={8} /> : delta < 0 ? <Minus size={8} /> : "="}
        {delta !== 0 ? Math.abs(delta) : ""}
      </span>
    </td>
  );
}

function AbsCell({ value }: { value: number }) {
  return (
    <td className="px-3 py-2 text-center">
      <span
        className="text-[11px] font-mono"
        style={{ color: netColor(value) }}
      >
        {value > 0 ? "+" : ""}{value}
      </span>
    </td>
  );
}

export function ScenarioComparisonTable({ scenarios, onClose }: ScenarioComparisonTableProps) {
  const [mode, setMode] = useState<"absolute" | "delta">("absolute");

  const whatifScenarios = scenarios.filter((s) => s.type === "whatif");
  const weightScenarios = scenarios.filter((s) => s.type === "weights");

  if (scenarios.length === 0) {
    return (
      <div
        className="bg-card border border-border rounded-xl overflow-hidden animate-float-up"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <TableIcon size={14} className="text-primary" />
            <p className="font-mono text-xs tracking-widest uppercase text-primary">Scenario Comparison</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <X size={16} />
          </button>
        </div>
        <div className="p-10 text-center">
          <TableIcon size={32} className="text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm font-mono text-muted-foreground">No saved scenarios to compare.</p>
          <p className="text-xs font-mono text-muted-foreground/50 mt-1">Save What-If or Weight scenarios first.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden animate-float-up"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <TableIcon size={14} className="text-primary" />
          <p className="font-mono text-xs tracking-widest uppercase text-primary">Scenario Comparison</p>
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            {scenarios.length} scenarios
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5">
            {(["absolute", "delta"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                  mode === m ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "absolute" ? "Values" : "Δ Delta"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 600 }}>
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground sticky left-0 bg-card min-w-[160px]">
                Scenario
              </th>
              <th className="px-3 py-3 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground min-w-[60px]">
                Net
              </th>
              {DIMENSIONS.map((d) => (
                <th key={d.key} className="px-3 py-3 text-center text-[10px] font-mono min-w-[64px]" style={{ color: `hsl(var(--${d.color}))` }}>
                  {d.icon}
                  <br />
                  <span className="text-muted-foreground/70">{d.label.split(" ")[0]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, idx) => {
              const net = netImpact(s.dimensions, s.weights);
              const baseNet = s.baseDimensions ? netImpact(s.baseDimensions) : null;
              return (
                <tr
                  key={s.id}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "bg-muted/5" : ""}`}
                >
                  {/* Scenario name cell */}
                  <td className="px-4 py-3 sticky left-0 bg-inherit min-w-[160px]">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {s.type === "whatif" ? "🔬" : "⚖"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold font-display text-foreground truncate max-w-[130px]">{s.name}</p>
                        <p className="text-[9px] font-mono text-muted-foreground truncate max-w-[130px]">
                          {s.decisionTitle.split(" ").slice(0, 3).join(" ")} · {s.timeframeLabel.split(" ")[0]}
                        </p>
                        <p className="text-[9px] font-mono text-muted-foreground/40">{s.createdAt}</p>
                      </div>
                    </div>
                  </td>

                  {/* Net impact */}
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-mono font-bold" style={{ color: netColor(net) }}>
                        {net > 0 ? "+" : ""}{net}
                      </span>
                      {mode === "delta" && baseNet !== null && (
                        <span className="text-[9px] font-mono flex items-center gap-0.5" style={{ color: deltaColor(net - baseNet) }}>
                          <ArrowRight size={7} />
                          {net - baseNet > 0 ? "+" : ""}{net - baseNet}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Dimension values */}
                  {DIMENSIONS.map((d) => {
                    const val = s.dimensions[d.key] ?? 0;
                    const baseVal = s.baseDimensions?.[d.key];
                    return mode === "absolute"
                      ? <AbsCell key={d.key} value={val} />
                      : <DeltaCell key={d.key} value={val} base={baseVal} />;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer legend */}
      <div className="px-5 py-3 border-t border-border/40 flex flex-wrap gap-4 text-[10px] font-mono text-muted-foreground/60">
        <span>
          <span style={{ color: "hsl(var(--positive))" }}>■</span> Beneficial (&gt;+20)
        </span>
        <span>
          <span style={{ color: "hsl(var(--dim-economy))" }}>■</span> Neutral (−20 to +20)
        </span>
        <span>
          <span style={{ color: "hsl(var(--negative))" }}>■</span> Harmful (&lt;−20)
        </span>
        {mode === "delta" && (
          <span className="ml-auto text-muted-foreground/40">Δ = modified − base (What-If only)</span>
        )}
        {whatifScenarios.length > 0 && weightScenarios.length > 0 && (
          <span>🔬 What-If · ⚖ Weights</span>
        )}
      </div>
    </div>
  );
}
