import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { SavedScenarios } from "@/components/dashboard/SavedScenarios";
import type { SavedScenario } from "@/components/dashboard/SavedScenarios";
import { ExportReport } from "@/components/dashboard/ExportReport";
import { MoralCompass } from "@/components/dashboard/MoralCompass";
import { ScenarioComparisonTable } from "@/components/dashboard/ScenarioComparisonTable";
import { TensionHeatmap } from "@/components/dashboard/TensionHeatmap";
import { DecisionJournal, useJournalCount } from "@/components/dashboard/DecisionJournal";
import { Menu, X, GitCompare, FlaskConical, Scale, ChevronLeft, Bookmark, FileDown, Compass, TableIcon, Grid3X3, BookOpen, Keyboard, Share2, Check } from "lucide-react";
import { toast } from "sonner";

type MobileTab = "dilemma" | "radar" | "stakeholders" | "timeline";

function ScoreChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center bg-muted/40 rounded-lg px-3 py-2 min-w-[72px]">
      <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
      <p className="text-sm font-mono font-bold mt-0.5" style={{ color }}>{value}</p>
    </div>
  );
}

type ActivePanel = "compare" | "whatif" | "weights" | "saved" | "export" | "compass" | "table" | "heatmap" | "journal" | null;

function ToolButton({
  active,
  onClick,
  icon: Icon,
  label,
  color,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  color?: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-secondary text-muted-foreground hover:text-foreground"
      }`}
      style={active && color ? { borderColor: color, color, background: `${color}18` } : {}}
    >
      <Icon size={13} />
      <span className="hidden sm:inline">{label}</span>
      {badge != null && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-mono flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// Animation variants for panel entrance/exit
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const panelVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18, ease: "easeIn" as const } },
};

// Animation variants for dilemma content transitions
const dilemmaVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  }),
};

// Spring animation for dimension cards
const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, type: "spring" as const, stiffness: 260, damping: 22 },
  }),
};

// ── URL state helpers ──
function parseUrlState() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const d = params.get("d");
  const t = params.get("t");
  const w = params.get("w");
  const decision = d ? DECISIONS.find((x) => x.id === d) : undefined;
  const tfIdx = t != null ? Math.max(0, Math.min(2, parseInt(t, 10) || 0)) : null;
  let weights: Record<string, number> | null = null;
  if (w) {
    weights = Object.fromEntries(DIMENSIONS.map((d) => [d.key, 1]));
    w.split(",").forEach((pair) => {
      const [k, v] = pair.split(":");
      const num = parseFloat(v);
      if (k && weights && k in weights && !isNaN(num) && num >= 0 && num <= 5) {
        weights[k] = num;
      }
    });
  }
  return { decision, tfIdx, weights };
}

export default function Index() {
  // Hydrate from URL on first render
  const initial = parseUrlState();
  const initialDecision = initial?.decision ?? DECISIONS[0];
  const initialTf = initial?.tfIdx != null && initial.tfIdx < initialDecision.timeframes.length ? initial.tfIdx : 0;

  const [selected, setSelected] = useState<Decision>(initialDecision);
  const [prevSelectedId, setPrevSelectedId] = useState<string>(initialDecision.id);
  const [dilemmaDirection, setDilemmaDirection] = useState(0);
  const [timeframeIdx, setTimeframeIdx] = useState(initialTf);
  const [trackedDimension, setTrackedDimension] = useState("environment");
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showKbHelp, setShowKbHelp] = useState(false);

  const [weights, setWeights] = useState<Record<string, number>>(
    initial?.weights ?? Object.fromEntries(DIMENSIONS.map((d) => [d.key, 1]))
  );
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  // Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("dilemma");

  // Radar SVG ref for PDF export
  const radarRef = useRef<SVGSVGElement | null>(null);

  const currentTimeframe = selected.timeframes[timeframeIdx];
  const prevTimeframe = timeframeIdx > 0 ? selected.timeframes[timeframeIdx - 1] : null;

  const dimValues = Object.values(currentTimeframe.dimensions);
  const netImpact = Math.round(dimValues.reduce((a, b) => a + b, 0) / dimValues.length);

  const hasCustomWeights = DIMENSIONS.some((d) => weights[d.key] !== 1);
  const weightedNet = (() => {
    let sum = 0, total = 0;
    DIMENSIONS.forEach((d) => {
      const w = weights[d.key] ?? 1;
      sum += (currentTimeframe.dimensions[d.key] ?? 0) * w;
      total += w;
    });
    return total > 0 ? Math.round(sum / total) : 0;
  })();

  // Journal badge — live count from localStorage
  const journalCount = useJournalCount(selected.id);

  const handleSelectDecision = useCallback((d: Decision) => {
    const oldIdx = DECISIONS.findIndex((dec) => dec.id === selected.id);
    const newIdx = DECISIONS.findIndex((dec) => dec.id === d.id);
    setDilemmaDirection(newIdx > oldIdx ? 1 : -1);
    setPrevSelectedId(selected.id);
    setSelected(d);
    setTimeframeIdx(0);
    setSidebarOpen(false);
  }, [selected.id]);

  // ── Sync state → URL (shareable) ──
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("d", selected.id);
    params.set("t", String(timeframeIdx));
    const customWeights = DIMENSIONS.filter((d) => (weights[d.key] ?? 1) !== 1);
    if (customWeights.length > 0) {
      params.set("w", customWeights.map((d) => `${d.key}:${weights[d.key]}`).join(","));
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [selected.id, timeframeIdx, weights]);

  // ── Share Scenario handler ──
  async function handleShare() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      const customCount = DIMENSIONS.filter((d) => (weights[d.key] ?? 1) !== 1).length;
      toast.success("Share link copied", {
        description: `${selected.title} · ${selected.timeframes[timeframeIdx].label}${customCount > 0 ? ` · ${customCount} custom weight${customCount === 1 ? "" : "s"}` : ""}`,
      });
    } catch {
      toast.error("Could not copy link to clipboard");
    }
  }

  // ── Keyboard Navigation ──
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't fire when typing in inputs/textareas, or with modifier keys
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const currentIdx = DECISIONS.findIndex((d) => d.id === selected.id);
      const maxTf = selected.timeframes.length - 1;
      const k = e.key;

      if (k === "Escape") {
        setActivePanel(null);
        setShowKbHelp(false);
      } else if (k === "ArrowUp" || k === "ArrowLeft") {
        if (currentIdx > 0) handleSelectDecision(DECISIONS[currentIdx - 1]);
      } else if (k === "ArrowDown" || k === "ArrowRight") {
        if (currentIdx < DECISIONS.length - 1) handleSelectDecision(DECISIONS[currentIdx + 1]);
      } else if (k === "1") {
        setTimeframeIdx(0);
      } else if (k === "2") {
        if (maxTf >= 1) setTimeframeIdx(1);
      } else if (k === "3") {
        if (maxTf >= 2) setTimeframeIdx(2);
      } else if (k === "?") {
        setShowKbHelp((v) => !v);
      } else if (k === "j" || k === "J") {
        setActivePanel((p) => (p === "journal" ? null : "journal"));
      } else if (k === "e" || k === "E") {
        setActivePanel((p) => (p === "export" ? null : "export"));
      } else if (k === "h" || k === "H") {
        setActivePanel((p) => (p === "heatmap" ? null : "heatmap"));
      } else if (k === "s" || k === "S") {
        e.preventDefault();
        handleShare();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // handleShare depends on selected/timeframeIdx/weights which are captured fresh each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, handleSelectDecision, timeframeIdx, weights]);

  function togglePanel(p: ActivePanel) {
    setActivePanel((prev) => (prev === p ? null : p));
  }

  function netColor(v: number) {
    return v >= 20 ? "hsl(var(--positive))" : v >= -20 ? "hsl(var(--dim-economy))" : "hsl(var(--negative))";
  }

  function handleSaveScenario(partial: Omit<SavedScenario, "id" | "createdAt">) {
    const now = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    setSavedScenarios((prev) => [
      { ...partial, id: `${Date.now()}`, createdAt: now },
      ...prev,
    ]);
  }

  function handleDeleteScenario(id: string) {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
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
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 lg:h-16 flex items-center justify-between gap-2">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2.5 shrink-0">
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
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <ToolButton active={activePanel === "compare"} onClick={() => togglePanel("compare")} icon={GitCompare} label="Compare" />
            <ToolButton active={activePanel === "whatif"} onClick={() => togglePanel("whatif")} icon={FlaskConical} label="What-If" />
            <ToolButton
              active={activePanel === "weights"}
              onClick={() => togglePanel("weights")}
              icon={Scale}
              label="Weights"
              color={hasCustomWeights ? "hsl(var(--dim-economy))" : undefined}
            />
            <ToolButton
              active={activePanel === "saved"}
              onClick={() => togglePanel("saved")}
              icon={Bookmark}
              label="Saved"
              badge={savedScenarios.length}
            />
            <ToolButton active={activePanel === "compass"} onClick={() => togglePanel("compass")} icon={Compass} label="Compass" />
            <ToolButton
              active={activePanel === "table"}
              onClick={() => togglePanel("table")}
              icon={TableIcon}
              label="Compare Scenarios"
              badge={savedScenarios.length >= 2 ? savedScenarios.length : undefined}
            />
            <ToolButton active={activePanel === "heatmap"} onClick={() => togglePanel("heatmap")} icon={Grid3X3} label="Heatmap" />
            <ToolButton
              active={activePanel === "journal"}
              onClick={() => togglePanel("journal")}
              icon={BookOpen}
              label="Journal"
              badge={journalCount > 0 ? journalCount : undefined}
            />
            <ToolButton active={activePanel === "export"} onClick={() => togglePanel("export")} icon={FileDown} label="Export" />
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-primary"
              title="Share scenario link (S)"
            >
              <Share2 size={12} />
            </button>
            <button
              onClick={() => setShowKbHelp((v) => !v)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border border-border bg-card hover:border-secondary text-muted-foreground hover:text-foreground"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard size={12} />
            </button>
          </div>

          {/* Right: score chips */}
          <div className="flex items-center gap-1 lg:gap-2 shrink-0">
            {hasCustomWeights && (
              <ScoreChip label="Weighted" value={`${weightedNet > 0 ? "+" : ""}${weightedNet}`} color={netColor(weightedNet)} />
            )}
            <ScoreChip label="Net Impact" value={`${netImpact > 0 ? "+" : ""}${netImpact}`} color={netColor(netImpact)} />
            <div className="hidden md:block">
              <ScoreChip label="Scale" value={selected.scale} color="hsl(var(--accent))" />
            </div>
            <div className="hidden lg:block">
              <ScoreChip label="Region" value={selected.region.split(" ")[0]} color="hsl(var(--muted-foreground))" />
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
                mobileTab === tab.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0, transition: { type: "spring", stiffness: 300, damping: 32 } }}
              exit={{ x: "-100%", transition: { duration: 0.2, ease: "easeIn" } }}
              className="lg:hidden fixed left-0 top-0 z-40 w-[280px] bg-card border-r border-border h-full overflow-y-auto p-4 space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Select Dilemma</p>
                <button onClick={() => setSidebarOpen(false)}><ChevronLeft size={16} className="text-muted-foreground" /></button>
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 lg:py-6">

        {/* ── Feature Panels (all animated) ── */}
        <AnimatePresence mode="wait">
          {activePanel === "compare" && (
            <motion.div key="compare" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <ComparisonMode primaryDecision={selected} onClose={() => setActivePanel(null)} />
            </motion.div>
          )}
          {activePanel === "whatif" && (
            <motion.div key="whatif" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <WhatIfEditor
                baseDimensions={currentTimeframe.dimensions}
                timeframeLabel={`${currentTimeframe.label} · ${currentTimeframe.years}`}
                decisionId={selected.id}
                decisionTitle={selected.title}
                onClose={() => setActivePanel(null)}
                onSave={handleSaveScenario}
              />
            </motion.div>
          )}
          {activePanel === "weights" && (
            <motion.div key="weights" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <WeightMatrix
                dimensions={currentTimeframe.dimensions}
                onWeightsChange={setWeights}
                onClose={() => setActivePanel(null)}
                decisionId={selected.id}
                decisionTitle={selected.title}
                timeframeLabel={`${currentTimeframe.label} · ${currentTimeframe.years}`}
                onSave={handleSaveScenario}
                initialWeights={weights}
              />
            </motion.div>
          )}
          {activePanel === "saved" && (
            <motion.div key="saved" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <SavedScenarios
                scenarios={savedScenarios}
                onClose={() => setActivePanel(null)}
                onDelete={handleDeleteScenario}
                onPreview={() => setActivePanel(null)}
              />
            </motion.div>
          )}
          {activePanel === "compass" && (
            <motion.div key="compass" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <MoralCompass
                selectedId={selected.id}
                onSelect={handleSelectDecision}
                onClose={() => setActivePanel(null)}
              />
            </motion.div>
          )}
          {activePanel === "table" && (
            <motion.div key="table" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <ScenarioComparisonTable
                scenarios={savedScenarios}
                onClose={() => setActivePanel(null)}
              />
            </motion.div>
          )}
          {activePanel === "heatmap" && (
            <motion.div key="heatmap" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <TensionHeatmap
                selectedId={selected.id}
                onSelect={handleSelectDecision}
                timeframeIdx={timeframeIdx}
                onClose={() => setActivePanel(null)}
              />
            </motion.div>
          )}
          {activePanel === "journal" && (
            <motion.div key="journal" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <DecisionJournal
                decision={selected}
                onClose={() => setActivePanel(null)}
              />
            </motion.div>
          )}
          {activePanel === "export" && (
            <motion.div key="export" className="mb-6" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <ExportReport
                decision={selected}
                currentTimeframe={currentTimeframe}
                timeframeIdx={timeframeIdx}
                weightedNet={hasCustomWeights ? weightedNet : null}
                weights={hasCustomWeights ? weights : null}
                radarRef={radarRef}
                onClose={() => setActivePanel(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Desktop Layout ── */}
        <div className="hidden lg:grid grid-cols-[280px_1fr_300px] gap-6 min-h-[calc(100vh-130px)]">
          {/* Left sidebar */}
          <aside className="space-y-6">
            <DecisionSelector selected={selected} onSelect={handleSelectDecision} />
            <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Historical Analogues</p>
              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selected.id + "-analogues"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                  >
                    {selected.historicalAnalogues.map((analogue, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="text-primary font-mono text-xs mt-0.5 shrink-0">→</span>
                        <span className="text-xs text-muted-foreground font-mono leading-relaxed">{analogue}</span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-6 min-w-0">
            {/* Animated dilemma header */}
            <AnimatePresence mode="wait" custom={dilemmaDirection}>
              <motion.div
                key={selected.id}
                custom={dilemmaDirection}
                variants={dilemmaVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <DilemmaHeader selected={selected} currentTimeframe={currentTimeframe} />
              </motion.div>
            </AnimatePresence>

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
                  svgRef={radarRef}
                />
              </div>

              {/* Spring-animated dimension cards */}
              <div className="grid grid-cols-2 gap-3 content-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selected.id}-${timeframeIdx}`}
                    className="grid grid-cols-2 gap-3 col-span-2"
                    initial="hidden"
                    animate="visible"
                  >
                    {DIMENSIONS.map((dim, i) => (
                      <motion.div key={dim.key} custom={i} variants={cardVariants}>
                        <DimensionCard
                          dimension={dim}
                          value={currentTimeframe.dimensions[dim.key] ?? 0}
                          compareValue={prevTimeframe?.dimensions[dim.key]}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
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
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id + "-meter"}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
                exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
              >
                <MoralMeter
                  moralWeight={selected.moralWeight}
                  irreversibility={selected.irreversibilityScore}
                  uncertainty={selected.uncertaintyScore}
                />
              </motion.div>
            </AnimatePresence>
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">Stakeholder Perspectives</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id + "-stakeholders"}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.05 } }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                >
                  <StakeholderPanel stakeholders={selected.stakeholders} />
                </motion.div>
              </AnimatePresence>
            </div>
            <AtlasPrinciple />
          </aside>
        </div>

        {/* ── Mobile Layout ── */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait" custom={dilemmaDirection}>
            {mobileTab === "dilemma" && (
              <motion.div
                key={selected.id + "-mobile-dilemma"}
                custom={dilemmaDirection}
                variants={dilemmaVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <DilemmaHeader selected={selected} currentTimeframe={currentTimeframe} />
                <MoralMeter
                  moralWeight={selected.moralWeight}
                  irreversibility={selected.irreversibilityScore}
                  uncertainty={selected.uncertaintyScore}
                />
                <AtlasPrinciple />
              </motion.div>
            )}
            {mobileTab === "radar" && (
              <motion.div
                key={selected.id + timeframeIdx + "-mobile-radar"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                className="space-y-4"
              >
                <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">Impact Surface</p>
                  <ImpactRadar
                    dimensions={currentTimeframe.dimensions}
                    compareData={prevTimeframe ? { label: prevTimeframe.label, dimensions: prevTimeframe.dimensions } : null}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {DIMENSIONS.map((dim, i) => (
                    <motion.div
                      key={dim.key}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <DimensionCard
                        dimension={dim}
                        value={currentTimeframe.dimensions[dim.key] ?? 0}
                        compareValue={prevTimeframe?.dimensions[dim.key]}
                      />
                    </motion.div>
                  ))}
                </div>
                <TemporalComparison
                  timeframes={selected.timeframes}
                  dimensionKey={trackedDimension}
                  onDimensionChange={setTrackedDimension}
                />
              </motion.div>
            )}
            {mobileTab === "stakeholders" && (
              <motion.div
                key={selected.id + "-mobile-stakeholders"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                className="space-y-4"
              >
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Stakeholder Perspectives</p>
                <StakeholderPanel stakeholders={selected.stakeholders} />
              </motion.div>
            )}
            {mobileTab === "timeline" && (
              <motion.div
                key={selected.id + timeframeIdx + "-mobile-timeline"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                className="space-y-4"
              >
                <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <TimelineSlider timeframes={selected.timeframes} activeIndex={timeframeIdx} onChange={setTimeframeIdx} />
                </div>
                <div className="bg-card border border-border rounded-xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">Impact Surface</p>
                  <ImpactRadar
                    dimensions={currentTimeframe.dimensions}
                    compareData={prevTimeframe ? { label: prevTimeframe.label, dimensions: prevTimeframe.dimensions } : null}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Keyboard shortcut help modal ── */}
      <AnimatePresence>
        {showKbHelp && (
          <>
            <motion.div
              key="kb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
              onClick={() => setShowKbHelp(false)}
            />
            <motion.div
              key="kb-modal"
              initial={{ opacity: 0, scale: 0.94, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.15 } }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[360px] bg-card border border-border rounded-xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Keyboard size={13} className="text-primary" />
                  <p className="font-mono text-xs tracking-widest uppercase text-primary">Keyboard Shortcuts</p>
                </div>
                <button onClick={() => setShowKbHelp(false)} className="text-muted-foreground hover:text-foreground p-1 rounded">
                  <X size={14} />
                </button>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { keys: ["↑", "↓"], label: "Previous / Next dilemma" },
                  { keys: ["←", "→"], label: "Previous / Next dilemma" },
                  { keys: ["1", "2", "3"], label: "Switch timeframe (Immediate / Short / Long)" },
                  { keys: ["Esc"], label: "Close active panel" },
                  { keys: ["?"], label: "Toggle this help" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono text-foreground"
                          style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-[9px] font-mono text-muted-foreground/40 pt-2 border-t border-border/40">
                  Shortcuts inactive when typing in inputs
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    <div className="rounded-xl p-5 lg:p-6 border border-border relative overflow-hidden"
      style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }} />
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
    <div className="bg-card border border-border/50 rounded-xl p-4"
      style={{ borderLeftColor: "hsl(var(--primary) / 0.5)", borderLeftWidth: "2px", boxShadow: "var(--shadow-card)" }}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary/70 mb-2">Atlas Principle</p>
      <p className="text-xs text-muted-foreground leading-relaxed font-display italic">
        "Atlas does not make the decision. It reveals the moral landscape clearly enough that leaders understand the full weight of their choices."
      </p>
    </div>
  );
}
