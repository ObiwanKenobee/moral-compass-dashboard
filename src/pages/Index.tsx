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
import { ComparisonMode } from "@/components/dashboard/ComparisonMode";
import { WhatIfEditor } from "@/components/dashboard/WhatIfEditor";
import { WeightMatrix } from "@/components/dashboard/WeightMatrix";
import { Menu, X, GitCompare, FlaskConical, Scale, ChevronLeft } from "lucide-react";

type MobileTab = "dilemma" | "radar" | "stakeholders" | "timeline";

function ScoreChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center bg-muted/40 rounded-lg px-3 py-2 min-w-[72px]">
      <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
      <p className="text-sm font-mono font-bold mt-0.5" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon: Icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-secondary text-muted-foreground hover:text-foreground"
      }`}
      style={active && color ? { borderColor: color, color, background: `${color}18` } : {}}
    >
      <Icon size={13} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function Index() {
  const [selected, setSelected] = useState<Decision>(DECISIONS[0]);
  const [timeframeIdx, setTimeframeIdx] = useState(0);
  const [trackedDimension, setTrackedDimension] = useState("environment");

  // Feature panels
  const [showComparison, setShowComparison] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showWeightMatrix, setShowWeightMatrix] = useState(false);

  // Weight state lifted up so weighted net shows in header
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(DIMENSIONS.map((d) => [d.key, 1]))
  );

  // Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("dilemma");

  const currentTimeframe = selected.timeframes[timeframeIdx];
  const prevTimeframe = timeframeIdx > 0 ? selected.timeframes[timeframeIdx - 1] : null;

  // Uniform net
  const dimValues = Object.values(currentTimeframe.dimensions);
  const netImpact = Math.round(dimValues.reduce((a, b) => a + b, 0) / dimValues.length);

  // Weighted net
  const weightedNet = (() => {
    let sum = 0;
    let totalWeight = 0;
    DIMENSIONS.forEach((d) => {
      const w = weights[d.key] ?? 1;
      sum += (currentTimeframe.dimensions[d.key] ?? 0) * w;
      totalWeight += w;
    });
    return totalWeight > 0 ? Math.round(sum / totalWeight) : 0;
  })();

  const hasCustomWeights = DIMENSIONS.some((d) => weights[d.key] !== 1);

  function handleSelectDecision(d: Decision) {
    setSelected(d);
    setTimeframeIdx(0);
    setSidebarOpen(false);
  }

  function netColor(v: number) {
    return v >= 20 ? "hsl(var(--positive))" : v >= -20 ? "hsl(var(--dim-economy))" : "hsl(var(--negative))";
  }

  const MOBILE_TABS: { id: MobileTab; label: string }[] = [
    { id: "dilemma", label: "Dilemma" },
    { id: "radar", label: "Impact" },
    { id: "stakeholders", label: "Stakeholders" },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <div className="min-h-screen bg-background grid-overlay">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 lg:h-16 flex items-center justify-between gap-3">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center animate-glow-pulse shrink-0"
                style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.4)" }}
              >
                <span className="text-xs lg:text-sm">⚖</span>
              </div>
              <div>
                <h1 className="font-display text-sm lg:text-base font-semibold text-foreground leading-none">Atlas</h1>
                <p className="text-[9px] lg:text-[10px] font-mono text-muted-foreground tracking-wider hidden sm:block">
                  MORAL TRADEOFF DASHBOARD
                </p>
              </div>
            </div>
          </div>

          {/* Center: tool buttons */}
          <div className="flex items-center gap-1.5">
            <ToolButton
              active={showComparison}
              onClick={() => { setShowComparison((v) => !v); setShowWhatIf(false); setShowWeightMatrix(false); }}
              icon={GitCompare}
              label="Compare"
            />
            <ToolButton
              active={showWhatIf}
              onClick={() => { setShowWhatIf((v) => !v); setShowComparison(false); setShowWeightMatrix(false); }}
              icon={FlaskConical}
              label="What-If"
            />
            <ToolButton
              active={showWeightMatrix}
              onClick={() => { setShowWeightMatrix((v) => !v); setShowComparison(false); setShowWhatIf(false); }}
              icon={Scale}
              label="Weights"
              color={hasCustomWeights ? "hsl(var(--dim-economy))" : undefined}
            />
          </div>

          {/* Right: score chips */}
          <div className="flex items-center gap-1.5 lg:gap-3">
            {hasCustomWeights && (
              <ScoreChip
                label="Weighted"
                value={`${weightedNet > 0 ? "+" : ""}${weightedNet}`}
                color={netColor(weightedNet)}
              />
            )}
            <ScoreChip
              label="Net Impact"
              value={`${netImpact > 0 ? "+" : ""}${netImpact}`}
              color={netColor(netImpact)}
            />
            <ScoreChip label="Scale" value={selected.scale} color="hsl(var(--accent))" />
            <div className="hidden sm:block">
              <ScoreChip
                label="Region"
                value={selected.region.split(" ")[0]}
                color="hsl(var(--muted-foreground))"
              />
            </div>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="lg:hidden border-t border-border bg-card/40 flex">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 py-2 text-[11px] font-mono transition-colors ${
                mobileTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-[280px] bg-card border-r border-border h-full overflow-y-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Select Dilemma</p>
              <button onClick={() => setSidebarOpen(false)}>
                <ChevronLeft size={16} className="text-muted-foreground" />
              </button>
            </div>
            <DecisionSelector selected={selected} onSelect={handleSelectDecision} />
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Historical Analogues</p>
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
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 lg:py-6">

        {/* ── Feature Panels (full-width, above main grid) ── */}
        {showComparison && (
          <div className="mb-6">
            <ComparisonMode
              primaryDecision={selected}
              onClose={() => setShowComparison(false)}
            />
          </div>
        )}
        {showWhatIf && (
          <div className="mb-6">
            <WhatIfEditor
              baseDimensions={currentTimeframe.dimensions}
              timeframeLabel={`${currentTimeframe.label} · ${currentTimeframe.years}`}
              onClose={() => setShowWhatIf(false)}
            />
          </div>
        )}
        {showWeightMatrix && (
          <div className="mb-6">
            <WeightMatrix
              dimensions={currentTimeframe.dimensions}
              onWeightsChange={setWeights}
              onClose={() => setShowWeightMatrix(false)}
            />
          </div>
        )}

        {/* ── Desktop Layout ── */}
        <div className="hidden lg:grid grid-cols-[280px_1fr_300px] gap-6 min-h-[calc(100vh-120px)]">

          {/* Left sidebar */}
          <aside className="space-y-6">
            <DecisionSelector selected={selected} onSelect={handleSelectDecision} />
            <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Historical Analogues</p>
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

          {/* Main content */}
          <main className="space-y-6 min-w-0">
            <DilemmaHeader selected={selected} currentTimeframe={currentTimeframe} />
            <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <TimelineSlider timeframes={selected.timeframes} activeIndex={timeframeIdx} onChange={setTimeframeIdx} />
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-6">
              <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Impact Surface</p>
                  <span className="text-[10px] font-mono text-muted-foreground/60">-100 harmful → +100 beneficial</span>
                </div>
                <ImpactRadar
                  dimensions={currentTimeframe.dimensions}
                  compareData={prevTimeframe ? { label: prevTimeframe.label, dimensions: prevTimeframe.dimensions } : null}
                />
              </div>
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
            <TemporalComparison
              timeframes={selected.timeframes}
              dimensionKey={trackedDimension}
              onDimensionChange={setTrackedDimension}
            />
          </main>

          {/* Right sidebar */}
          <aside className="space-y-6">
            <MoralMeter
              moralWeight={selected.moralWeight}
              irreversibility={selected.irreversibilityScore}
              uncertainty={selected.uncertaintyScore}
            />
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Stakeholder Perspectives</p>
              <StakeholderPanel stakeholders={selected.stakeholders} />
            </div>
            <AtlasPrinciple />
          </aside>
        </div>

        {/* ── Mobile Layout ── */}
        <div className="lg:hidden">
          {mobileTab === "dilemma" && (
            <div className="space-y-4">
              <DilemmaHeader selected={selected} currentTimeframe={currentTimeframe} />
              <MoralMeter
                moralWeight={selected.moralWeight}
                irreversibility={selected.irreversibilityScore}
                uncertainty={selected.uncertaintyScore}
              />
              <AtlasPrinciple />
            </div>
          )}

          {mobileTab === "radar" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Impact Surface</p>
                </div>
                <ImpactRadar
                  dimensions={currentTimeframe.dimensions}
                  compareData={prevTimeframe ? { label: prevTimeframe.label, dimensions: prevTimeframe.dimensions } : null}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DIMENSIONS.map((dim) => (
                  <DimensionCard
                    key={dim.key}
                    dimension={dim}
                    value={currentTimeframe.dimensions[dim.key] ?? 0}
                    compareValue={prevTimeframe?.dimensions[dim.key]}
                  />
                ))}
              </div>
              <TemporalComparison
                timeframes={selected.timeframes}
                dimensionKey={trackedDimension}
                onDimensionChange={setTrackedDimension}
              />
            </div>
          )}

          {mobileTab === "stakeholders" && (
            <div className="space-y-4">
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Stakeholder Perspectives</p>
              <StakeholderPanel stakeholders={selected.stakeholders} />
            </div>
          )}

          {mobileTab === "timeline" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <TimelineSlider timeframes={selected.timeframes} activeIndex={timeframeIdx} onChange={setTimeframeIdx} />
              </div>
              <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Impact Surface</p>
                </div>
                <ImpactRadar
                  dimensions={currentTimeframe.dimensions}
                  compareData={prevTimeframe ? { label: prevTimeframe.label, dimensions: prevTimeframe.dimensions } : null}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DilemmaHeader({
  selected,
  currentTimeframe,
}: {
  selected: Decision;
  currentTimeframe: { label: string; years: string };
}) {
  return (
    <div
      className="rounded-xl p-5 lg:p-6 border border-border relative overflow-hidden"
      style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }}
      />
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10px] tracking-widest uppercase text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
          Active Dilemma
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {currentTimeframe.label} · {currentTimeframe.years}
        </span>
      </div>
      <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground mb-1">{selected.title}</h2>
      <p className="text-sm text-muted-foreground font-mono">{selected.subtitle}</p>
      <div className="mt-4 border-t border-border/50 pt-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Core Tension</p>
        <p className="text-sm text-foreground/80 leading-relaxed italic font-display">"{selected.keyTension}"</p>
      </div>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{selected.context}</p>
      </div>
    </div>
  );
}

function AtlasPrinciple() {
  return (
    <div
      className="bg-card border border-border/50 rounded-xl p-4"
      style={{ borderLeftColor: "hsl(var(--primary) / 0.5)", borderLeftWidth: "2px", boxShadow: "var(--shadow-card)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary/70 mb-2">Atlas Principle</p>
      <p className="text-xs text-muted-foreground leading-relaxed font-display italic">
        "Atlas does not make the decision. It reveals the moral landscape clearly enough that leaders understand the full weight of their choices."
      </p>
    </div>
  );
}
