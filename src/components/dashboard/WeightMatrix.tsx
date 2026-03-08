import { useState } from "react";
import { DIMENSIONS } from "@/data/decisions";
import { SaveDialog } from "./SavedScenarios";
import type { SavedScenario } from "./SavedScenarios";
import { RotateCcw, X, Bookmark } from "lucide-react";

interface WeightMatrixProps {
  dimensions: Record<string, number>;
  onWeightsChange: (weights: Record<string, number>) => void;
  onClose: () => void;
  decisionId: string;
  decisionTitle: string;
  timeframeLabel: string;
  onSave: (scenario: Omit<SavedScenario, "id" | "createdAt">) => void;
}

const DEFAULT_WEIGHTS: Record<string, number> = {
  environment: 1,
  economy: 1,
  wellbeing: 1,
  culture: 1,
  equity: 1,
  longterm: 1,
};

const WEIGHT_LABELS: Record<number, string> = {
  0: "Ignored",
  0.5: "Minor",
  1: "Normal",
  2: "Important",
  3: "Critical",
  5: "Absolute",
};

function getWeightLabel(w: number): string {
  const closest = [0, 0.5, 1, 2, 3, 5].reduce((prev, curr) =>
    Math.abs(curr - w) < Math.abs(prev - w) ? curr : prev
  );
  return WEIGHT_LABELS[closest] ?? `${w}×`;
}

function getWeightColor(w: number): string {
  if (w === 0) return "hsl(var(--muted-foreground))";
  if (w <= 0.5) return "hsl(var(--muted-foreground))";
  if (w === 1) return "hsl(var(--foreground))";
  if (w <= 2) return "hsl(var(--dim-economy))";
  if (w <= 3) return "hsl(var(--dim-culture))";
  return "hsl(var(--negative))";
}

export function WeightMatrix({ dimensions, onWeightsChange, onClose, decisionId, decisionTitle, timeframeLabel, onSave }: WeightMatrixProps) {
  const [weights, setWeights] = useState<Record<string, number>>({ ...DEFAULT_WEIGHTS });
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleChange = (key: string, val: number) => {
    const newWeights = { ...weights, [key]: val };
    setWeights(newWeights);
    onWeightsChange(newWeights);
  };

  const handleReset = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    onWeightsChange({ ...DEFAULT_WEIGHTS });
  };

  const weightedNet = (() => {
    let sum = 0;
    let totalWeight = 0;
    DIMENSIONS.forEach((d) => {
      const w = weights[d.key] ?? 1;
      sum += (dimensions[d.key] ?? 0) * w;
      totalWeight += w;
    });
    return totalWeight > 0 ? Math.round(sum / totalWeight) : 0;
  })();

  const uniformNet = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / 6);
  const hasCustomWeights = DIMENSIONS.some((d) => weights[d.key] !== 1);

  function netColor(v: number) {
    if (v >= 20) return "hsl(var(--positive))";
    if (v >= -20) return "hsl(var(--dim-economy))";
    return "hsl(var(--negative))";
  }

  function handleSave(name: string) {
    onSave({
      name,
      type: "weights",
      decisionId,
      decisionTitle,
      timeframeLabel,
      dimensions: { ...dimensions },
      weights: { ...weights },
    });
    setShowSaveDialog(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-float-up" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <p className="font-mono text-xs tracking-widest uppercase text-primary">⚖ Decision Weight Matrix</p>
        <div className="flex items-center gap-2">
          {hasCustomWeights && (
            <>
              <button
                onClick={() => setShowSaveDialog((v) => !v)}
                className="flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded border border-primary/30 hover:border-primary/60"
              >
                <Bookmark size={10} />
                Save
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-secondary"
              >
                <RotateCcw size={10} />
                Reset
              </button>
            </>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="px-5 pt-3">
          <SaveDialog onSave={handleSave} onCancel={() => setShowSaveDialog(false)} />
        </div>
      )}

      <div className="p-5 space-y-5">
        <p className="text-xs font-mono text-muted-foreground">
          Assign personal importance weights to each dimension. The dashboard recalculates a weighted net impact reflecting your values.
        </p>

        <div className="space-y-4">
          {DIMENSIONS.map((dim) => {
            const w = weights[dim.key] ?? 1;
            const rawVal = dimensions[dim.key] ?? 0;
            const contribution = rawVal * w;
            return (
              <div key={dim.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground">{dim.icon} {dim.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      raw: {rawVal > 0 ? "+" : ""}{rawVal} × {w}× =
                    </span>
                    <span className="text-xs font-mono font-bold w-14 text-right" style={{ color: contribution >= 0 ? "hsl(var(--dim-economy))" : "hsl(var(--negative))" }}>
                      {Math.round(contribution) > 0 ? "+" : ""}{Math.round(contribution)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={w}
                    onChange={(e) => handleChange(dim.key, parseFloat(e.target.value))}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${getWeightColor(w)} 0%, ${getWeightColor(w)} ${(w / 5) * 100}%, hsl(var(--border)) ${(w / 5) * 100}%, hsl(var(--border)) 100%)`,
                      accentColor: getWeightColor(w),
                    }}
                  />
                  <div className="w-20 text-right">
                    <span className="text-xs font-mono font-bold" style={{ color: getWeightColor(w) }}>
                      {w}× {getWeightLabel(w)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Uniform Net</p>
            <p className="text-2xl font-mono font-bold" style={{ color: netColor(uniformNet) }}>
              {uniformNet > 0 ? "+" : ""}{uniformNet}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground mt-0.5">equal weights</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              {hasCustomWeights ? (
                <>
                  <p className="text-[10px] font-mono text-muted-foreground">Δ</p>
                  <p className="text-lg font-mono font-bold" style={{ color: netColor(weightedNet - uniformNet) }}>
                    {weightedNet - uniformNet > 0 ? "+" : ""}{weightedNet - uniformNet}
                  </p>
                </>
              ) : (
                <p className="text-[10px] font-mono text-muted-foreground">Adjust weights<br />to see changes</p>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Your Net</p>
            <p className="text-2xl font-mono font-bold" style={{ color: netColor(weightedNet) }}>
              {weightedNet > 0 ? "+" : ""}{weightedNet}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground mt-0.5">your values</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Weight Distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            {(() => {
              const total = DIMENSIONS.reduce((sum, d) => sum + (weights[d.key] ?? 1), 0);
              return DIMENSIONS.map((dim) => {
                const pct = total > 0 ? ((weights[dim.key] ?? 1) / total) * 100 : 0;
                return (
                  <div
                    key={dim.key}
                    className="transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${pct}%`,
                      background: `hsl(var(--${dim.color}))`,
                      opacity: weights[dim.key] === 0 ? 0 : 0.8,
                    }}
                    title={`${dim.label}: ${pct.toFixed(0)}%`}
                  />
                );
              });
            })()}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: `hsl(var(--${dim.color}))` }} />
                <span className="text-[9px] font-mono text-muted-foreground">{dim.icon} {weights[dim.key]}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
