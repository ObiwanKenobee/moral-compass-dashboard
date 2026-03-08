import { useRef, useState } from "react";
import { DIMENSIONS } from "@/data/decisions";
import type { Decision, TimeframeData } from "@/data/decisions";
import { X, Download, Copy, Check } from "lucide-react";

interface ExportReportProps {
  decision: Decision;
  currentTimeframe: TimeframeData;
  timeframeIdx: number;
  weightedNet: number | null;
  weights: Record<string, number> | null;
  onClose: () => void;
}

function ImpactBar({ value }: { value: number }) {
  const abs = Math.abs(value);
  const isPos = value >= 0;
  function color(v: number) {
    if (v >= 40) return "#34d399";
    if (v >= 0) return "#fbbf24";
    if (v >= -40) return "#fb923c";
    return "#f87171";
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
        <div className="absolute left-1/2 top-0 w-px h-full bg-border z-10" />
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            width: `${abs / 2}%`,
            left: isPos ? "50%" : undefined,
            right: isPos ? undefined : `50%`,
            background: color(value),
            opacity: 0.9,
          }}
        />
      </div>
      <span
        className="text-xs font-mono font-bold w-10 text-right"
        style={{ color: color(value) }}
      >
        {value > 0 ? "+" : ""}{value}
      </span>
    </div>
  );
}

export function ExportReport({
  decision,
  currentTimeframe,
  timeframeIdx,
  weightedNet,
  weights,
  onClose,
}: ExportReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const uniformNet = Math.round(
    Object.values(currentTimeframe.dimensions).reduce((a, b) => a + b, 0) / 6
  );

  const hasCustomWeights = weights && DIMENSIONS.some((d) => weights[d.key] !== 1);

  function netColor(v: number): string {
    if (v >= 20) return "hsl(var(--positive))";
    if (v >= -20) return "hsl(var(--dim-economy))";
    return "hsl(var(--negative))";
  }

  function generateTextReport(): string {
    const divider = "═".repeat(60);
    const thin = "─".repeat(60);
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    let lines: string[] = [
      divider,
      "  ATLAS MORAL TRADEOFF ANALYSIS",
      `  Generated: ${now}`,
      divider,
      "",
      `  DILEMMA: ${decision.title}`,
      `  ${decision.subtitle}`,
      `  Region: ${decision.region}  |  Scale: ${decision.scale}`,
      `  Timeframe: ${currentTimeframe.label} (${currentTimeframe.years})`,
      "",
      thin,
      "  CORE TENSION",
      thin,
      `  "${decision.keyTension}"`,
      "",
      thin,
      "  MORAL COMPLEXITY INDICATORS",
      thin,
      `  Moral Weight:      ${decision.moralWeight}/100`,
      `  Irreversibility:   ${decision.irreversibilityScore}/100`,
      `  Uncertainty:       ${decision.uncertaintyScore}/100`,
      "",
      thin,
      "  IMPACT DIMENSIONS",
      thin,
    ];

    DIMENSIONS.forEach((d) => {
      const val = currentTimeframe.dimensions[d.key] ?? 0;
      const sign = val > 0 ? "+" : "";
      const bar = val > 0
        ? "█".repeat(Math.round(val / 10))
        : "░".repeat(Math.round(Math.abs(val) / 10));
      lines.push(`  ${d.icon} ${d.label.padEnd(20)} ${sign}${val}  ${bar}`);
    });

    lines.push(``, `  Uniform Net Impact:   ${uniformNet > 0 ? "+" : ""}${uniformNet}`);

    if (hasCustomWeights && weightedNet !== null) {
      lines.push(`  Weighted Net Impact:  ${weightedNet > 0 ? "+" : ""}${weightedNet}`);
      lines.push(``, `  Active Weights:`);
      DIMENSIONS.forEach((d) => {
        lines.push(`    ${d.icon} ${d.label.padEnd(20)} ${weights![d.key]}×`);
      });
    }

    lines.push(
      "",
      thin,
      "  STAKEHOLDER PERSPECTIVES",
      thin,
    );

    decision.stakeholders.forEach((s) => {
      const sNet = Math.round(Object.values(s.impacts).reduce((a, b) => a + b, 0) / 6);
      lines.push(``, `  ${s.stakeholder} (Net: ${sNet > 0 ? "+" : ""}${sNet})`);
      lines.push(`  ${s.description}`);
      lines.push(`  "${s.quote}"`);
    });

    lines.push(
      "",
      thin,
      "  HISTORICAL ANALOGUES",
      thin,
    );
    decision.historicalAnalogues.forEach((a) => lines.push(`  → ${a}`));

    lines.push(
      "",
      divider,
      `  Atlas does not make the decision.`,
      `  It reveals the moral landscape clearly enough that`,
      `  leaders understand the full weight of their choices.`,
      divider,
    );

    return lines.join("\n");
  }

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(generateTextReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback — do nothing
    }
  }

  function handleDownloadText() {
    const text = generateTextReport();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-${decision.id}-${currentTimeframe.label.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-float-up" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30">
        <p className="font-mono text-xs tracking-widest uppercase text-primary">📋 Export Analysis Report</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-secondary transition-colors"
          >
            {copied ? <Check size={12} className="text-positive" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy text"}
          </button>
          <button
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
          >
            <Download size={12} />
            Download .txt
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Report preview */}
      <div ref={reportRef} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Top meta */}
        <div
          className="rounded-xl p-5 border border-border relative overflow-hidden"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }} />
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
              Atlas Analysis
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {currentTimeframe.label} · {currentTimeframe.years}
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">{decision.title}</h2>
          <p className="text-xs text-muted-foreground font-mono mb-3">{decision.subtitle}</p>
          <div className="flex flex-wrap gap-3 text-xs font-mono text-muted-foreground">
            <span>🌍 {decision.region}</span>
            <span>📏 {decision.scale}</span>
            <span>⚡ Complexity {decision.moralWeight}/100</span>
            <span>🔒 Irreversibility {decision.irreversibilityScore}/100</span>
          </div>
        </div>

        {/* Core tension */}
        <div className="border-l-2 border-primary/40 pl-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Core Tension</p>
          <p className="text-sm italic text-foreground/80 font-display leading-relaxed">"{decision.keyTension}"</p>
        </div>

        {/* Net impact summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Uniform Net</p>
            <p className="text-2xl font-mono font-bold" style={{ color: netColor(uniformNet) }}>
              {uniformNet > 0 ? "+" : ""}{uniformNet}
            </p>
          </div>
          {hasCustomWeights && weightedNet !== null && (
            <div className="bg-muted/30 rounded-lg p-3 text-center border border-primary/20">
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Weighted Net</p>
              <p className="text-2xl font-mono font-bold" style={{ color: netColor(weightedNet) }}>
                {weightedNet > 0 ? "+" : ""}{weightedNet}
              </p>
            </div>
          )}
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Timeframe</p>
            <p className="text-sm font-mono font-bold text-foreground">T{timeframeIdx + 1}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{currentTimeframe.label}</p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-muted/20 rounded-lg p-4 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Impact Dimensions</p>
          {DIMENSIONS.map((d) => {
            const val = currentTimeframe.dimensions[d.key] ?? 0;
            return (
              <div key={d.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-foreground">{d.icon} {d.label}</span>
                  {hasCustomWeights && weights && (
                    <span className="text-[10px] font-mono text-muted-foreground">{weights[d.key]}× weight</span>
                  )}
                </div>
                <ImpactBar value={val} />
              </div>
            );
          })}
        </div>

        {/* Stakeholders */}
        <div className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Stakeholder Perspectives</p>
          {decision.stakeholders.map((s, i) => {
            const sNet = Math.round(Object.values(s.impacts).reduce((a, b) => a + b, 0) / 6);
            return (
              <div key={i} className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold font-display text-foreground">{s.stakeholder}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{s.description}</p>
                  </div>
                  <span className="text-base font-mono font-bold shrink-0" style={{ color: netColor(sNet) }}>
                    {sNet > 0 ? "+" : ""}{sNet}
                  </span>
                </div>
                <blockquote className="border-l-2 border-primary/30 pl-3">
                  <p className="text-xs italic text-muted-foreground">"{s.quote}"</p>
                </blockquote>
              </div>
            );
          })}
        </div>

        {/* Historical analogues */}
        <div className="bg-muted/20 rounded-lg p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Historical Analogues</p>
          <div className="space-y-1.5">
            {decision.historicalAnalogues.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-primary font-mono text-xs">→</span>
                <span className="text-xs font-mono text-muted-foreground">{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Atlas signature */}
        <div className="text-center py-3 border-t border-border/40">
          <p className="text-[10px] font-mono text-muted-foreground/50 italic">
            Atlas does not make the decision. It reveals the moral landscape.
          </p>
        </div>
      </div>
    </div>
  );
}
