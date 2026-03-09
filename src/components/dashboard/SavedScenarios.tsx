import { useState } from "react";
import { DIMENSIONS } from "@/data/decisions";
import { Bookmark, Trash2, Eye, X, Plus } from "lucide-react";

export interface SavedScenario {
  id: string;
  name: string;
  type: "whatif" | "weights";
  decisionId: string;
  decisionTitle: string;
  timeframeLabel: string;
  dimensions: Record<string, number>;      // effective (modified) dims for whatif, base for weights
  baseDimensions?: Record<string, number>; // original dims before whatif modification
  weights?: Record<string, number>;        // only for weight scenarios
  createdAt: string;
}

interface SavedScenariosProps {
  onClose: () => void;
  onPreview: (scenario: SavedScenario) => void;
  scenarios: SavedScenario[];
  onDelete: (id: string) => void;
}

function netImpact(dims: Record<string, number>, weights?: Record<string, number>): number {
  let sum = 0;
  let total = 0;
  DIMENSIONS.forEach((d) => {
    const w = weights ? (weights[d.key] ?? 1) : 1;
    sum += (dims[d.key] ?? 0) * w;
    total += w;
  });
  return total > 0 ? Math.round(sum / total) : 0;
}

function netColor(v: number): string {
  if (v >= 20) return "hsl(var(--positive))";
  if (v >= -20) return "hsl(var(--dim-economy))";
  return "hsl(var(--negative))";
}

export function SavedScenarios({ onClose, onPreview, scenarios, onDelete }: SavedScenariosProps) {
  const [filter, setFilter] = useState<"all" | "whatif" | "weights">("all");

  const filtered = scenarios.filter((s) => filter === "all" || s.type === filter);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-float-up" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Bookmark size={14} className="text-primary" />
          <p className="font-mono text-xs tracking-widest uppercase text-primary">Saved Scenarios</p>
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            {scenarios.length}
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
          <X size={16} />
        </button>
      </div>

      <div className="p-5">
        {/* Filter tabs */}
        <div className="flex gap-1 mb-4">
          {(["all", "whatif", "weights"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-[11px] font-mono transition-all border ${
                filter === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-secondary"
              }`}
            >
              {f === "all" ? "All" : f === "whatif" ? "🔬 What-If" : "⚖ Weights"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Bookmark size={32} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-mono text-muted-foreground">No saved scenarios yet.</p>
            <p className="text-xs font-mono text-muted-foreground/60 mt-1">
              Use the 💾 button in What-If or Weights panels to save.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((s) => {
              const net = netImpact(s.dimensions, s.weights);
              return (
                <div
                  key={s.id}
                  className="bg-muted/30 border border-border rounded-lg p-4 hover:border-secondary transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {s.type === "whatif" ? "🔬" : "⚖"}
                        </span>
                        <p className="text-sm font-semibold font-display text-foreground truncate">{s.name}</p>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">
                        {s.decisionTitle} · {s.timeframeLabel}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-mono text-muted-foreground">Net</p>
                      <p className="text-base font-mono font-bold" style={{ color: netColor(net) }}>
                        {net > 0 ? "+" : ""}{net}
                      </p>
                    </div>
                  </div>

                  {/* Dimension mini bars */}
                  <div className="grid grid-cols-6 gap-1 mb-3">
                    {DIMENSIONS.map((d) => {
                      const val = s.dimensions[d.key] ?? 0;
                      const baseVal = s.baseDimensions?.[d.key];
                      const delta = baseVal !== undefined ? val - baseVal : 0;
                      return (
                        <div key={d.key} className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px]">{d.icon}</span>
                          <div className="w-full h-6 bg-muted rounded-sm overflow-hidden flex flex-col-reverse">
                            <div
                              className="w-full rounded-sm transition-all duration-500"
                              style={{
                                height: `${Math.abs(val) / 2}%`,
                                background: val >= 0 ? "hsl(var(--positive))" : "hsl(var(--negative))",
                                opacity: 0.8,
                              }}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-muted-foreground">{val > 0 ? "+" : ""}{val}</span>
                          {s.type === "whatif" && baseVal !== undefined && delta !== 0 && (
                            <span className="text-[7px] font-mono" style={{ color: delta > 0 ? "hsl(var(--positive))" : "hsl(var(--negative))" }}>
                              {delta > 0 ? "↑" : "↓"}{Math.abs(delta)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Weights badge if applicable */}
                  {s.type === "weights" && s.weights && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {DIMENSIONS.filter((d) => (s.weights![d.key] ?? 1) !== 1).map((d) => (
                        <span
                          key={d.key}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{ background: `hsl(var(--${d.color}) / 0.15)`, color: `hsl(var(--${d.color}))` }}
                        >
                          {d.icon} {s.weights![d.key]}×
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[9px] font-mono text-muted-foreground/50 mb-3">{s.createdAt}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onPreview(s)}
                      className="flex items-center gap-1 flex-1 justify-center py-1.5 rounded border border-border text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-secondary transition-colors"
                    >
                      <Eye size={11} />
                      Preview
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded border border-border text-[11px] font-mono text-muted-foreground hover:text-negative hover:border-negative/40 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Save dialog shown inline within What-If / Weight panels ──
interface SaveDialogProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function SaveDialog({ onSave, onCancel }: SaveDialogProps) {
  const [name, setName] = useState("");
  return (
    <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
      <Plus size={13} className="text-primary shrink-0" />
      <input
        type="text"
        placeholder="Name this scenario…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name.trim()); if (e.key === "Escape") onCancel(); }}
        autoFocus
        className="flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
      <button
        onClick={() => { if (name.trim()) onSave(name.trim()); }}
        disabled={!name.trim()}
        className="text-[10px] font-mono text-primary hover:text-primary/80 disabled:opacity-40 transition-colors px-2 py-1 rounded border border-primary/30 hover:border-primary/60"
      >
        Save
      </button>
      <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
        <X size={13} />
      </button>
    </div>
  );
}
