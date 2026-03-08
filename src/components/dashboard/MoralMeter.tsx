interface MoralMeterProps {
  irreversibility: number;
  uncertainty: number;
  moralWeight: number;
}

function Ring({ value, label, color, size = 80 }: { value: number; label: string; color: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={14}
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {value}
        </text>
      </svg>
      <p className="text-[10px] font-mono text-muted-foreground text-center leading-tight max-w-[80px]">{label}</p>
    </div>
  );
}

export function MoralMeter({ irreversibility, uncertainty, moralWeight }: MoralMeterProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
        Moral Complexity Indicators
      </p>
      <div className="flex items-center justify-around">
        <Ring
          value={moralWeight}
          label="Moral Weight"
          color="hsl(var(--primary))"
        />
        <Ring
          value={irreversibility}
          label="Irreversibility"
          color="hsl(var(--negative))"
        />
        <Ring
          value={uncertainty}
          label="Uncertainty"
          color="hsl(var(--dim-equity))"
        />
      </div>
      <p className="text-[11px] font-mono text-muted-foreground mt-4 text-center leading-relaxed">
        Higher irreversibility demands greater caution.
        <br />
        Higher uncertainty demands humility.
      </p>
    </div>
  );
}
