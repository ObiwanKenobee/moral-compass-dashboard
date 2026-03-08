import { useState, useCallback } from "react";
import { DIMENSIONS } from "@/data/decisions";
import { ImpactRadar } from "./ImpactRadar";
import { RotateCcw, X } from "lucide-react";

interface WhatIfEditorProps {
  baseDimensions: Record<string, number>;
  timeframeLabel: string;
  onClose: () => void;
}

function DimSlider({
  dim,
  value,
  baseValue,
  onChange,
}: {
  dim: { key: string; label: string; icon: string; color: string };
  value: number;
  baseValue: number;
  onChange: (key: string, val: number) => void;
}) {
  const delta = value - baseValue;

  function barColor(v: number) {
    if (v >= 40) return "hsl(var(--positive))";
    if (v >= 0) return "hsl(var(--dim-economy))";
    if (v >= -40) return "hsl(25 90% 60%)";
    return "hsl(var(--negative))";
  }

  return (
    <div className="space-y-2 py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-foreground">
          {dim.icon} {dim.label}
        </span>
        <div className="flex items-center gap-3">
          {delta !== 0 && (
            <span className="text-[10px] font-mono" style={{ color: delta > 0 ? "hsl(var(--positive))" : "hsl(var(--negative))" }}>
              {delta > 0 ? "+" : ""}{delta} from base
            </span>
          )}
          <span className="text-sm font-mono font-bold w-10 text-right" style={{ color: barColor(value) }}>
            {value > 0 ? "+" : ""}{value}
          </span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={-100}
          max={100}
          value={value}
          onChange={(e) => onChange(dim.key, parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              hsl(var(--muted)) 0%, 
              hsl(var(--muted)) ${((value + 100) / 200) * 100}%, 
              hsl(var(--border)) ${((value + 100) / 200) * 100}%, 
              hsl(var(--border)) 100%
            )`,
            accentColor: barColor(value),
          }}
        />
        {/* Center tick mark */}
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-3 bg-border pointer-events-none" />
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] font-mono text-muted-foreground/50">−100 harmful</span>
        <span className="text-[9px] font-mono text-muted-foreground/50">0</span>
        <span className="text-[9px] font-mono text-muted-foreground/50">+100 beneficial</span>
      </div>
    </div>
  );
}

export function WhatIfEditor({ baseDimensions, timeframeLabel, onClose }: WhatIfEditorProps) {
  const [modifiedDims, setModifiedDims] = useState<Record<string, number>>({ ...baseDimensions });

  const handleChange = useCallback((key: string, val: number) => {
    setModifiedDims((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleReset = () => setModifiedDims({ ...baseDimensions });

  const baseNet = Math.round(Object.values(baseDimensions).reduce((a, b) => a + b, 0) / 6);
  const modNet = Math.round(Object.values(modifiedDims).reduce((a, b) => a + b, 0) / 6);
  const netDelta = modNet - baseNet;

  function netColor(v: number) {
    if (v >= 20) return "hsl(var(--positive))";
    if (v >= -20) return "hsl(var(--dim-economy))";
    return "hsl(var(--negative))";
  }

  const hasChanges = DIMENSIONS.some((d) => modifiedDims[d.key] !== baseDimensions[d.key]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-float-up" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs tracking-widest uppercase text-primary">🔬 What-If Editor</p>
          <span className="text-[10px] font-mono text-muted-foreground">· {timeframeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-secondary"
            >
              <RotateCcw size={10} />
              Reset
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-0">
        {/* Sliders */}
        <div className="p-5 border-r border-border overflow-y-auto max-h-[520px]">
          <p className="text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-wider">
            Adjust dimension values to simulate modified scenarios
          </p>
          {DIMENSIONS.map((dim) => (
            <DimSlider
              key={dim.key}
              dim={dim}
              value={modifiedDims[dim.key] ?? 0}
              baseValue={baseDimensions[dim.key] ?? 0}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* Live preview */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Live Impact Surface</p>

          {/* Net impact delta */}
          <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground">Base Net</p>
              <p className="text-lg font-mono font-bold" style={{ color: netColor(baseNet) }}>
                {baseNet > 0 ? "+" : ""}{baseNet}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-mono text-muted-foreground">Change</p>
              <p className="text-lg font-mono font-bold" style={{ color: netColor(netDelta) }}>
                {netDelta > 0 ? "▲+" : netDelta < 0 ? "▼" : "="}{netDelta !== 0 ? netDelta : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-muted-foreground">Modified Net</p>
              <p className="text-lg font-mono font-bold" style={{ color: netColor(modNet) }}>
                {modNet > 0 ? "+" : ""}{modNet}
              </p>
            </div>
          </div>

          <ImpactRadar
            dimensions={modifiedDims}
            compareData={hasChanges ? { label: "Base scenario", dimensions: baseDimensions } : null}
          />

          {hasChanges && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-2">Modified Dimensions</p>
              <div className="space-y-1">
                {DIMENSIONS.filter((d) => modifiedDims[d.key] !== baseDimensions[d.key]).map((d) => {
                  const delta = modifiedDims[d.key] - baseDimensions[d.key];
                  return (
                    <div key={d.key} className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground">{d.icon} {d.label}</span>
                      <span style={{ color: delta > 0 ? "hsl(var(--positive))" : "hsl(var(--negative))" }}>
                        {baseDimensions[d.key]} → {modifiedDims[d.key]} ({delta > 0 ? "+" : ""}{delta})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
