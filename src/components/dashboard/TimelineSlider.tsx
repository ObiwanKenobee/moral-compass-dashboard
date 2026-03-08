import type { TimeframeData } from "@/data/decisions";

interface TimelineSliderProps {
  timeframes: TimeframeData[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function TimelineSlider({ timeframes, activeIndex, onChange }: TimelineSliderProps) {
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
        Temporal Horizon
      </p>
      <div className="relative">
        {/* Track */}
        <div className="flex items-center gap-0">
          {timeframes.map((tf, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            return (
              <div key={i} className="flex items-center flex-1">
                {/* Node */}
                <button
                  onClick={() => onChange(i)}
                  className={`relative z-10 flex flex-col items-center group`}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "border-primary bg-primary/20 shadow-glow-amber scale-110"
                        : isPast
                        ? "border-muted-foreground/40 bg-muted/50"
                        : "border-border bg-muted/30 hover:border-secondary"
                    }`}
                  >
                    <span className={`text-xs font-mono font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      T{i + 1}
                    </span>
                  </div>
                  <div className="mt-2 text-center pointer-events-none">
                    <p className={`text-xs font-semibold font-mono ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {tf.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono">{tf.years}</p>
                  </div>
                </button>

                {/* Connector */}
                {i < timeframes.length - 1 && (
                  <div className="flex-1 h-px mx-1 relative overflow-hidden">
                    <div className="h-full bg-border" />
                    <div
                      className="absolute inset-0 h-full transition-all duration-500"
                      style={{
                        background: "hsl(var(--primary))",
                        opacity: isPast ? 0.5 : 0,
                        transform: isPast ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "left",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
