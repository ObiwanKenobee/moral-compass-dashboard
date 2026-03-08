import { useState } from "react";
import { DECISIONS, DIMENSIONS } from "@/data/decisions";
import type { Decision } from "@/data/decisions";
import { DecisionSelector } from "@/components/dashboard/DecisionSelector";
import { ImpactRadar } from "@/components/dashboard/ImpactRadar";
import { DimensionCard } from "@/components/dashboard/DimensionCard";
import { StakeholderPanel } from "@/components/dashboard/StakeholderPanel";
import { TimelineSlider } from "@/components/dashboard/TimelineSlider";
import { MoralMeter } from "@/components/dashboard/MoralMeter";
import { TemporalComparison } from "@/components/dashboard/TemporalComparison";

function ScoreChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center bg-muted/40 rounded-lg px-3 py-2 min-w-[80px]">
      <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
      <p className="text-sm font-mono font-bold mt-0.5" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export default function Index() {
  const [selected, setSelected] = useState<Decision>(DECISIONS[0]);
  const [timeframeIdx, setTimeframeIdx] = useState(0);
  const [trackedDimension, setTrackedDimension] = useState("environment");

  const currentTimeframe = selected.timeframes[timeframeIdx];
  const prevTimeframe = timeframeIdx > 0 ? selected.timeframes[timeframeIdx - 1] : null;

  // Net impact across all dimensions
  const dimValues = Object.values(currentTimeframe.dimensions);
  const netImpact = Math.round(dimValues.reduce((a, b) => a + b, 0) / dimValues.length);

  function handleSelectDecision(d: Decision) {
    setSelected(d);
    setTimeframeIdx(0);
  }

  return (
    <div className="min-h-screen bg-background grid-overlay">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center animate-glow-pulse"
              style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.4)" }}
            >
              <span className="text-sm">⚖</span>
            </div>
            <div>
              <h1 className="font-display text-base font-semibold text-foreground leading-none">
                Atlas
              </h1>
              <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
                MORAL TRADEOFF DASHBOARD
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreChip
              label="Net Impact"
              value={`${netImpact > 0 ? "+" : ""}${netImpact}`}
              color={netImpact >= 20 ? "hsl(var(--positive))" : netImpact >= -20 ? "hsl(var(--dim-economy))" : "hsl(var(--negative))"}
            />
            <ScoreChip
              label="Scale"
              value={selected.scale}
              color="hsl(var(--accent))"
            />
            <ScoreChip
              label="Region"
              value={selected.region.split(" ")[0]}
              color="hsl(var(--muted-foreground))"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-[280px_1fr_300px] gap-6 min-h-[calc(100vh-120px)]">

          {/* ── Left Sidebar: Decision selector ── */}
          <aside className="space-y-6">
            <DecisionSelector selected={selected} onSelect={handleSelectDecision} />

            {/* Historical analogues */}
            <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
                Historical Analogues
              </p>
              <div className="space-y-2">
                {selected.historicalAnalogues.map((analogue, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary font-mono text-xs mt-0.5 shrink-0">→</span>
                    <span className="text-xs text-muted-foreground font-mono leading-relaxed">{analogue}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="space-y-6 min-w-0">
            {/* Decision header */}
            <div
              className="rounded-xl p-6 border border-border relative overflow-hidden"
              style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}
            >
              {/* Decorative amber line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] tracking-widest uppercase text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
                      Active Dilemma
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {currentTimeframe.label} · {currentTimeframe.years}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground font-mono">{selected.subtitle}</p>
                </div>
              </div>

              {/* Key tension */}
              <div className="mt-4 border-t border-border/50 pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  Core Tension
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed italic font-display">
                  "{selected.keyTension}"
                </p>
              </div>

              {/* Context */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{selected.context}</p>
              </div>
            </div>

            {/* Timeline */}
            <div
              className="bg-card border border-border rounded-xl p-5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <TimelineSlider
                timeframes={selected.timeframes}
                activeIndex={timeframeIdx}
                onChange={setTimeframeIdx}
              />
            </div>

            {/* Radar + Dimension cards */}
            <div className="grid grid-cols-[1fr_1fr] gap-6">
              {/* Radar chart */}
              <div
                className="bg-card border border-border rounded-xl p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                    Impact Surface
                  </p>
                  <span className="text-[10px] font-mono text-muted-foreground/60">
                    -100 harmful → +100 beneficial
                  </span>
                </div>
                <ImpactRadar
                  dimensions={currentTimeframe.dimensions}
                  compareData={
                    prevTimeframe
                      ? { label: prevTimeframe.label, dimensions: prevTimeframe.dimensions }
                      : null
                  }
                />
              </div>

              {/* Dimension cards grid */}
              <div className="grid grid-cols-2 gap-3 content-start">
                {DIMENSIONS.map((dim) => (
                  <DimensionCard
                    key={dim.key}
                    dimension={dim}
                    value={currentTimeframe.dimensions[dim.key] ?? 0}
                    compareValue={prevTimeframe?.dimensions[dim.key]}
                  />
                ))}
              </div>
            </div>

            {/* Temporal comparison */}
            <TemporalComparison
              timeframes={selected.timeframes}
              dimensionKey={trackedDimension}
              onDimensionChange={setTrackedDimension}
            />
          </main>

          {/* ── Right Sidebar ── */}
          <aside className="space-y-6">
            <MoralMeter
              moralWeight={selected.moralWeight}
              irreversibility={selected.irreversibilityScore}
              uncertainty={selected.uncertaintyScore}
            />

            {/* Stakeholder perspectives */}
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
                Stakeholder Perspectives
              </p>
              <StakeholderPanel
                stakeholders={selected.stakeholders}
              />
            </div>

            {/* Philosophical note */}
            <div
              className="bg-card border border-border/50 rounded-xl p-4"
              style={{ borderLeftColor: "hsl(var(--primary) / 0.5)", borderLeftWidth: "2px", boxShadow: "var(--shadow-card)" }}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary/70 mb-2">
                Atlas Principle
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed font-display italic">
                "Atlas does not make the decision. It reveals the moral landscape clearly enough that 
                leaders understand the full weight of their choices."
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
