import { DECISIONS } from "@/data/decisions";
import type { Decision } from "@/data/decisions";

interface DecisionSelectorProps {
  selected: Decision;
  onSelect: (decision: Decision) => void;
}

const scaleColors: Record<string, string> = {
  National: "text-dim-economy",
  Regional: "text-dim-equity",
  Planetary: "text-dim-wellbeing",
};

export function DecisionSelector({ selected, onSelect }: DecisionSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
        Select Moral Dilemma
      </p>
      {DECISIONS.map((d) => {
        const isActive = d.id === selected.id;
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group ${
              isActive
                ? "border-primary bg-primary/8 shadow-glow-amber"
                : "border-border bg-card hover:border-secondary hover:bg-secondary/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold font-display leading-snug ${
                    isActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  {d.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.subtitle}</p>
              </div>
              <span className={`text-[10px] font-mono shrink-0 mt-0.5 ${scaleColors[d.scale] ?? "text-muted-foreground"}`}>
                {d.scale}
              </span>
            </div>
            {/* Moral weight bar */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">Complexity</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${d.moralWeight}%`,
                    background: `hsl(var(--primary))`,
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{d.moralWeight}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
