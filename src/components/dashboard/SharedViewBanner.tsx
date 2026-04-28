import { motion } from "framer-motion";
import { Link2, RotateCcw, X } from "lucide-react";
import { DIMENSIONS } from "@/data/decisions";

interface SharedViewBannerProps {
  decisionTitle: string;
  timeframeLabel: string;
  weights: Record<string, number>;
  hasCustomWeights: boolean;
  onReset: () => void;
  onDismiss: () => void;
}

export function SharedViewBanner({
  decisionTitle,
  timeframeLabel,
  weights,
  hasCustomWeights,
  onReset,
  onDismiss,
}: SharedViewBannerProps) {
  const customWeightsList = DIMENSIONS.filter((d) => (weights[d.key] ?? 1) !== 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      role="status"
      aria-label="Shared view detected"
      className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex flex-wrap items-center gap-3"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <Link2 size={14} className="text-primary" />
        <p className="font-mono text-[11px] tracking-widest uppercase text-primary">
          Shared view detected
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground min-w-0 flex-1">
        <span className="bg-card border border-border rounded px-2 py-0.5">
          <span className="text-muted-foreground/60">Dilemma:</span>{" "}
          <span className="text-foreground">{decisionTitle}</span>
        </span>
        <span className="bg-card border border-border rounded px-2 py-0.5">
          <span className="text-muted-foreground/60">Timeframe:</span>{" "}
          <span className="text-foreground">{timeframeLabel}</span>
        </span>
        {hasCustomWeights && customWeightsList.length > 0 && (
          <span className="bg-card border border-border rounded px-2 py-0.5">
            <span className="text-muted-foreground/60">Weights:</span>{" "}
            <span className="text-foreground">
              {customWeightsList
                .map((d) => `${d.icon} ${d.label} ${weights[d.key]}×`)
                .join(", ")}
            </span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded border border-primary/30 hover:border-primary/60"
          title="Reset to default view"
        >
          <RotateCcw size={10} />
          Reset to defaults
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss banner"
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}
