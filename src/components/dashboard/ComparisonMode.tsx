import { useState } from "react";
import { DECISIONS, DIMENSIONS } from "@/data/decisions";
import type { Decision } from "@/data/decisions";
import { ImpactRadar } from "./ImpactRadar";
import { X } from "lucide-react";

interface ComparisonModeProps {
  primaryDecision: Decision;
  onClose: () => void;
}

function DimRow({ label, icon, valA, valB }: { label: string; icon: string; valA: number; valB: number }) {
  const diff = valB - valA;
  function color(v: number) {
    if (v >= 40) return "hsl(var(--positive))";
    if (v >= 0) return "hsl(var(--dim-economy))";
    if (v >= -40) return "hsl(25 90% 60%)";
    return "hsl(var(--negative))";
  }
  return (
    <div className="grid grid-cols-[1fr_72px_72px_56px] gap-2 items-center py-1.5 border-b border-border/40">
      <span className="text-xs font-mono text-muted-foreground">{icon} {label}</span>
      <span className="text-xs font-mono font-bold text-right" style={{ color: color(valA) }}>
        {valA > 0 ? "+" : ""}{valA}
      </span>
      <span className="text-xs font-mono font-bold text-right" style={{ color: color(valB) }}>
        {valB > 0 ? "+" : ""}{valB}
      </span>
      <span className="text-xs font-mono font-bold text-right" style={{ color: diff > 0 ? "hsl(var(--positive))" : diff < 0 ? "hsl(var(--negative))" : "hsl(var(--muted-foreground))" }}>
        {diff > 0 ? "+" : ""}{diff}
      </span>
    </div>
  );
}

export function ComparisonMode({ primaryDecision, onClose }: ComparisonModeProps) {
  const [compareDecision, setCompareDecision] = useState<Decision>(
    DECISIONS.find((d) => d.id !== primaryDecision.id) ?? DECISIONS[1]
  );
  const [timeframeA, setTimeframeA] = useState(0);
  const [timeframeB, setTimeframeB] = useState(0);

  const tfA = primaryDecision.timeframes[timeframeA];
  const tfB = compareDecision.timeframes[timeframeB];

  const netA = Math.round(Object.values(tfA.dimensions).reduce((a, b) => a + b, 0) / 6);
  const netB = Math.round(Object.values(tfB.dimensions).reduce((a, b) => a + b, 0) / 6);

  function netColor(v: number) {
    if (v >= 20) return "hsl(var(--positive))";
    if (v >= -20) return "hsl(var(--dim-economy))";
    return "hsl(var(--negative))";
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-float-up" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <p className="font-mono text-xs tracking-widest uppercase text-primary">⚡ Decision Comparison Mode</p>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Decision pickers — stack on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dilemma A */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-mono text-primary tracking-widest uppercase">Dilemma A</span>
            </div>
            <div className="bg-secondary/40 rounded-lg p-3 border border-primary/20">
              <p className="text-sm font-semibold font-display text-foreground">{primaryDecision.title}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{primaryDecision.subtitle}</p>
            </div>
            <div className="flex gap-1">
              {primaryDecision.timeframes.map((tf, i) => (
                <button
                  key={i}
                  onClick={() => setTimeframeA(i)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono transition-all border ${
                    i === timeframeA
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-secondary"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dilemma B */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-mono text-accent tracking-widest uppercase">Dilemma B</span>
            </div>
            <select
              value={compareDecision.id}
              onChange={(e) => {
                const d = DECISIONS.find((dec) => dec.id === e.target.value);
                if (d) { setCompareDecision(d); setTimeframeB(0); }
              }}
              className="w-full bg-secondary/40 border border-accent/20 rounded-lg px-3 py-2 text-sm font-display text-foreground focus:outline-none focus:border-accent/50 cursor-pointer"
            >
              {DECISIONS.filter((d) => d.id !== primaryDecision.id).map((d) => (
                <option key={d.id} value={d.id} className="bg-card">
                  {d.title}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              {compareDecision.timeframes.map((tf, i) => (
                <button
                  key={i}
                  onClick={() => setTimeframeB(i)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono transition-all border ${
                    i === timeframeB
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-secondary"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Radar comparison — stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-primary uppercase tracking-wider truncate max-w-[60%]">
                {primaryDecision.title.substring(0, 22)}…
              </span>
              <span className="text-sm font-mono font-bold" style={{ color: netColor(netA) }}>
                Net: {netA > 0 ? "+" : ""}{netA}
              </span>
            </div>
            <ImpactRadar dimensions={tfA.dimensions} />
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider truncate max-w-[60%]">
                {compareDecision.title.substring(0, 22)}…
              </span>
              <span className="text-sm font-mono font-bold" style={{ color: netColor(netB) }}>
                Net: {netB > 0 ? "+" : ""}{netB}
              </span>
            </div>
            <ImpactRadar dimensions={tfB.dimensions} />
          </div>
        </div>

        {/* Dimension-by-dimension table */}
        <div className="bg-muted/20 rounded-lg p-4">
          <div className="grid grid-cols-[1fr_72px_72px_56px] gap-2 mb-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Dimension</span>
            <span className="text-[10px] font-mono text-primary uppercase tracking-wider text-right">A</span>
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider text-right">B</span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider text-right">Δ</span>
          </div>
          {DIMENSIONS.map((dim) => (
            <DimRow
              key={dim.key}
              label={dim.label}
              icon={dim.icon}
              valA={tfA.dimensions[dim.key] ?? 0}
              valB={tfB.dimensions[dim.key] ?? 0}
            />
          ))}
          <div className="grid grid-cols-[1fr_72px_72px_56px] gap-2 items-center pt-2 mt-1">
            <span className="text-[10px] font-mono text-foreground uppercase tracking-wider font-bold">Net Average</span>
            <span className="text-sm font-mono font-bold text-right" style={{ color: netColor(netA) }}>
              {netA > 0 ? "+" : ""}{netA}
            </span>
            <span className="text-sm font-mono font-bold text-right" style={{ color: netColor(netB) }}>
              {netB > 0 ? "+" : ""}{netB}
            </span>
            <span className="text-sm font-mono font-bold text-right" style={{ color: netColor(netB - netA) }}>
              {netB - netA > 0 ? "+" : ""}{netB - netA}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
