import { useRef, useState, useEffect } from "react";
import { DIMENSIONS } from "@/data/decisions";
import type { Decision, TimeframeData } from "@/data/decisions";
import { X, Download, Copy, Check, FileImage, BookOpen, Printer } from "lucide-react";

interface JournalEntry {
  id: string;
  decisionId: string;
  text: string;
  createdAt: string;
  timestamp: number;
}

function loadJournalEntries(decisionId: string): JournalEntry[] {
  try {
    const raw = localStorage.getItem("atlas-journal-entries");
    const all: JournalEntry[] = raw ? JSON.parse(raw) : [];
    return all
      .filter((e) => e.decisionId === decisionId)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

interface ExportReportProps {
  decision: Decision;
  currentTimeframe: TimeframeData;
  timeframeIdx: number;
  weightedNet: number | null;
  weights: Record<string, number> | null;
  radarRef?: React.RefObject<SVGSVGElement | null>;
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
      <span className="text-xs font-mono font-bold w-10 text-right" style={{ color: color(value) }}>
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
  radarRef,
  onClose,
}: ExportReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Live-load journal entries for this dilemma
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    loadJournalEntries(decision.id)
  );
  useEffect(() => {
    setJournalEntries(loadJournalEntries(decision.id));
  }, [decision.id]);

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

    const lines: string[] = [
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

    lines.push("", thin, "  STAKEHOLDER PERSPECTIVES", thin);

    decision.stakeholders.forEach((s) => {
      const sNet = Math.round(Object.values(s.impacts).reduce((a, b) => a + b, 0) / 6);
      lines.push(``, `  ${s.stakeholder} (Net: ${sNet > 0 ? "+" : ""}${sNet})`);
      lines.push(`  ${s.description}`);
      lines.push(`  "${s.quote}"`);
    });

    lines.push("", thin, "  HISTORICAL ANALOGUES", thin);
    decision.historicalAnalogues.forEach((a) => lines.push(`  → ${a}`));

    // Journal reflections
    if (journalEntries.length > 0) {
      lines.push("", thin, "  LEADER'S JOURNAL REFLECTIONS", thin);
      journalEntries.forEach((entry) => {
        lines.push(``, `  [${entry.createdAt}]`);
        lines.push(`  ${entry.text}`);
      });
    }

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
      // ignore
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

  async function handleDownloadPDF() {
    setPdfLoading(true);
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 14;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ── Page 1: header + core metrics ──
      // Atlas branding strip
      pdf.setFillColor(14, 15, 20);
      pdf.rect(0, 0, pageW, pageH, "F");

      // Amber accent bar
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 0, pageW, 3, "F");

      // Title block
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(245, 158, 11);
      pdf.text("ATLAS", margin, (y = 18));

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(130, 140, 160);
      pdf.text("MORAL TRADEOFF ANALYSIS", margin, y + 5);

      const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      pdf.text(now, pageW - margin, y + 5, { align: "right" });

      // Separator line
      pdf.setDrawColor(40, 48, 64);
      pdf.setLineWidth(0.4);
      pdf.line(margin, (y += 10), pageW - margin, y);
      y += 8;

      // Dilemma title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(215, 220, 230);
      const titleLines = pdf.splitTextToSize(decision.title, contentW);
      pdf.text(titleLines, margin, y);
      y += titleLines.length * 7;

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 115, 135);
      pdf.text(decision.subtitle, margin, y);
      y += 6;

      // Meta chips row
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(130, 140, 160);
      pdf.text(`🌍 ${decision.region}  ·  📏 ${decision.scale}  ·  📅 ${currentTimeframe.label} (${currentTimeframe.years})`, margin, y);
      y += 8;

      // Core tension
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.8);
      pdf.line(margin, y, margin, y + 16);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.setTextColor(200, 205, 215);
      const tensionLines = pdf.splitTextToSize(`"${decision.keyTension}"`, contentW - 8);
      pdf.text(tensionLines, margin + 5, y + 4);
      y += Math.max(18, tensionLines.length * 5 + 6);

      // Separator
      pdf.setDrawColor(40, 48, 64);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 8;

      // Complexity chips
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(130, 140, 160);
      pdf.text("MORAL COMPLEXITY INDICATORS", margin, y);
      y += 6;

      const chips = [
        { label: "Moral Weight", value: decision.moralWeight, suffix: "/100" },
        { label: "Irreversibility", value: decision.irreversibilityScore, suffix: "/100" },
        { label: "Uncertainty", value: decision.uncertaintyScore, suffix: "/100" },
      ];
      chips.forEach((c, i) => {
        const cx = margin + i * (contentW / 3);
        pdf.setFillColor(25, 30, 40);
        pdf.roundedRect(cx, y, contentW / 3 - 3, 18, 2, 2, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100, 115, 135);
        pdf.text(c.label, cx + 4, y + 6);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(245, 158, 11);
        pdf.text(`${c.value}`, cx + 4, y + 15);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100, 115, 135);
        pdf.text(c.suffix, cx + 4 + pdf.getTextWidth(`${c.value}`) * 1.1, y + 15);
      });
      y += 24;

      // Net impact scores
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(130, 140, 160);
      pdf.text("NET IMPACT SCORES", margin, y);
      y += 6;

      function netRGB(v: number): [number, number, number] {
        if (v >= 20) return [52, 211, 153];
        if (v >= -20) return [245, 158, 11];
        return [239, 68, 68];
      }

      const scoreBoxes = [
        { label: "Uniform Net", value: uniformNet },
        ...(hasCustomWeights && weightedNet !== null ? [{ label: "Weighted Net", value: weightedNet }] : []),
      ];
      scoreBoxes.forEach((sb, i) => {
        const bx = margin + i * 46;
        const [r2, g2, b2] = netRGB(sb.value);
        pdf.setFillColor(25, 30, 40);
        pdf.roundedRect(bx, y, 42, 22, 2, 2, "F");
        pdf.setDrawColor(r2, g2, b2);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(bx, y, 42, 22, 2, 2, "S");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100, 115, 135);
        pdf.text(sb.label, bx + 4, y + 7);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(r2, g2, b2);
        pdf.text(`${sb.value > 0 ? "+" : ""}${sb.value}`, bx + 4, y + 18);
      });
      y += 28;

      // ── Radar chart capture ──
      if (radarRef?.current) {
        try {
          const svgEl = radarRef.current;
          const serializer = new XMLSerializer();
          const svgStr = serializer.serializeToString(svgEl);
          const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
          const svgUrl = URL.createObjectURL(svgBlob);

          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = 800;
              canvas.height = 760;
              const ctx = canvas.getContext("2d")!;
              ctx.fillStyle = "#0e0f14";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const imgData = canvas.toDataURL("image/png");
              const radarW = 80;
              const radarH = 76;
              pdf.addImage(imgData, "PNG", margin, y, radarW, radarH);
              URL.revokeObjectURL(svgUrl);
              resolve();
            };
            img.onerror = () => { URL.revokeObjectURL(svgUrl); resolve(); };
            img.src = svgUrl;
          });

          // Dimension list beside radar
          const dimX = margin + 84;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          pdf.setTextColor(130, 140, 160);
          pdf.text("DIMENSIONS", dimX, y + 4);

          DIMENSIONS.forEach((d, i) => {
            const val = currentTimeframe.dimensions[d.key] ?? 0;
            const [r2, g2, b2] = netRGB(val);
            const dy = y + 10 + i * 10;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(180, 190, 200);
            pdf.text(`${d.label}`, dimX, dy);
            // Bar
            const barX = dimX + 52;
            const barMaxW = contentW - 52 - 84 + margin;
            pdf.setFillColor(30, 38, 52);
            pdf.roundedRect(barX, dy - 4, barMaxW, 5, 1, 1, "F");
            const barFill = Math.abs(val) / 100 * barMaxW;
            pdf.setFillColor(r2, g2, b2);
            if (val >= 0) {
              pdf.roundedRect(barX + barMaxW / 2, dy - 4, barFill / 2, 5, 1, 1, "F");
            } else {
              pdf.roundedRect(barX + barMaxW / 2 - barFill / 2, dy - 4, barFill / 2, 5, 1, 1, "F");
            }
            // Value
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(7);
            pdf.setTextColor(r2, g2, b2);
            pdf.text(`${val > 0 ? "+" : ""}${val}`, pageW - margin, dy, { align: "right" });
          });

          y += 82;
        } catch {
          // radar capture failed — skip
          y += 4;
        }
      }

      // ── Page 2: Stakeholders ──
      pdf.addPage();
      pdf.setFillColor(14, 15, 20);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 0, pageW, 3, "F");

      y = margin + 8;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(130, 140, 160);
      pdf.text("STAKEHOLDER PERSPECTIVES", margin, y);
      y += 8;

      decision.stakeholders.forEach((s) => {
        const sNet = Math.round(Object.values(s.impacts).reduce((a, b) => a + b, 0) / 6);
        const [sr, sg, sb2] = netRGB(sNet);

        // Stakeholder card
        if (y > pageH - 60) {
          pdf.addPage();
          pdf.setFillColor(14, 15, 20);
          pdf.rect(0, 0, pageW, pageH, "F");
          y = margin + 8;
        }

        pdf.setFillColor(22, 27, 38);
        pdf.roundedRect(margin, y, contentW, 40, 3, 3, "F");

        // Net score badge
        pdf.setFillColor(sr, sg, sb2);
        pdf.roundedRect(pageW - margin - 18, y + 4, 16, 12, 2, 2, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(10, 12, 18);
        pdf.text(`${sNet > 0 ? "+" : ""}${sNet}`, pageW - margin - 10, y + 12, { align: "center" });

        // Name
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(215, 220, 230);
        pdf.text(s.stakeholder, margin + 4, y + 10);

        // Description
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100, 115, 135);
        pdf.text(s.description, margin + 4, y + 17);

        // Quote
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(180, 190, 205);
        const qLines = pdf.splitTextToSize(`"${s.quote}"`, contentW - 12);
        pdf.text(qLines.slice(0, 2), margin + 5, y + 25);

        // Left accent bar
        pdf.setFillColor(sr, sg, sb2);
        pdf.rect(margin, y + 6, 2, 28, "F");

        y += 46;
      });

      y += 6;
      pdf.setDrawColor(40, 48, 64);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, pageW - margin, y);
      y += 8;

      // Historical analogues
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(130, 140, 160);
      pdf.text("HISTORICAL ANALOGUES", margin, y);
      y += 6;

      decision.historicalAnalogues.forEach((a) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(180, 190, 205);
        pdf.text(`→  ${a}`, margin + 2, y);
        y += 6;
      });

      // ── Page 3: Leader's Journal (if entries exist) ──
      if (journalEntries.length > 0) {
        pdf.addPage();
        pdf.setFillColor(14, 15, 20);
        pdf.rect(0, 0, pageW, pageH, "F");
        // Amber accent bar
        pdf.setFillColor(245, 158, 11);
        pdf.rect(0, 0, pageW, 3, "F");

        y = margin + 8;

        // Section header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(130, 140, 160);
        pdf.text("LEADER'S JOURNAL REFLECTIONS", margin, y);
        y += 4;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(70, 82, 100);
        pdf.text(`${journalEntries.length} reflection${journalEntries.length !== 1 ? "s" : ""} for ${decision.title}`, margin, y + 5);
        y += 12;

        pdf.setDrawColor(40, 48, 64);
        pdf.setLineWidth(0.4);
        pdf.line(margin, y, pageW - margin, y);
        y += 8;

        journalEntries.forEach((entry) => {
          // Page break guard
          if (y > pageH - 40) {
            pdf.addPage();
            pdf.setFillColor(14, 15, 20);
            pdf.rect(0, 0, pageW, pageH, "F");
            pdf.setFillColor(245, 158, 11);
            pdf.rect(0, 0, pageW, 3, "F");
            y = margin + 8;
          }

          // Entry card background
          const entryLines = pdf.splitTextToSize(entry.text, contentW - 10);
          const cardH = entryLines.length * 5 + 16;
          pdf.setFillColor(22, 27, 38);
          pdf.roundedRect(margin, y, contentW, cardH, 2, 2, "F");

          // Left amber accent bar
          pdf.setFillColor(245, 158, 11);
          pdf.rect(margin, y + 4, 2, cardH - 8, "F");

          // Timestamp
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(70, 82, 100);
          pdf.text(entry.createdAt, margin + 6, y + 8);

          // Entry text
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(190, 198, 212);
          pdf.text(entryLines, margin + 6, y + 15);

          y += cardH + 5;
        });
      }

      // Footer
      y = pageH - 16;
      pdf.setDrawColor(40, 48, 64);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageW - margin, y);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7);
      pdf.setTextColor(70, 82, 100);
      pdf.text("Atlas does not make the decision. It reveals the moral landscape.", margin, y + 6);
      pdf.text("atlas.moraldashboard.app", pageW - margin, y + 6, { align: "right" });

      pdf.save(`atlas-${decision.id}-${currentTimeframe.label.toLowerCase()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
    setPdfLoading(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-float-up" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30 flex-wrap gap-2">
        <p className="font-mono text-xs tracking-widest uppercase text-primary">📋 Export Analysis Report</p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-secondary transition-colors"
          >
            {copied ? <Check size={12} className="text-positive" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy text"}
          </button>
          <button
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-secondary transition-colors"
          >
            <Download size={12} />
            .txt
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
          >
            <FileImage size={12} />
            {pdfLoading ? "Generating…" : "Download PDF"}
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

        {/* Journal reflections */}
        {journalEntries.length > 0 && (
          <div className="border border-primary/20 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border-b border-primary/15">
              <BookOpen size={12} className="text-primary" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                Leader's Journal Reflections
              </p>
              <span className="text-[10px] font-mono bg-primary/15 text-primary px-1.5 py-0.5 rounded ml-auto">
                {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="bg-primary/5 border border-primary/15 rounded-lg px-4 py-3">
                  <p className="text-xs font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {entry.text}
                  </p>
                  <p className="text-[9px] font-mono text-muted-foreground/40 mt-2">{entry.createdAt}</p>
                </div>
              ))}
              <p className="text-[9px] font-mono text-muted-foreground/40 italic text-center pt-1">
                Journal entries will appear as Page 3 in the PDF export.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
