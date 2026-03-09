import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { DIMENSIONS } from "@/data/decisions";

interface ImpactRadarProps {
  dimensions: Record<string, number>;
  compareData?: { label: string; dimensions: Record<string, number> } | null;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

const W = 400;
const H = 380;
const CX = W / 2;
const CY = H / 2;
const R = 130; // max radius

// Map a value [-100, 100] to a radius fraction [0, 1] (0 = center at -100, 1 = edge at +100)
function valueToRadius(v: number) {
  return ((v + 100) / 200) * R;
}

function polarPoint(angle: number, radius: number) {
  const a = angle - Math.PI / 2;
  return {
    x: CX + radius * Math.cos(a),
    y: CY + radius * Math.sin(a),
  };
}

function dimsToPoints(dims: Record<string, number>) {
  return DIMENSIONS.map((d, i) => {
    const angle = (2 * Math.PI * i) / DIMENSIONS.length;
    const r = valueToRadius(dims[d.key] ?? 0);
    return polarPoint(angle, r);
  });
}

function pointsToPath(pts: { x: number; y: number }[]) {
  if (!pts.length) return "";
  return (
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z"
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPoints(
  from: { x: number; y: number }[],
  to: { x: number; y: number }[],
  t: number
) {
  return from.map((p, i) => ({
    x: lerp(p.x, to[i].x, t),
    y: lerp(p.y, to[i].y, t),
  }));
}

// Animated polygon using framer-motion spring
function AnimatedPolygon({
  targetDims,
  stroke,
  fill,
  strokeWidth = 1.5,
  strokeDasharray,
  opacity = 1,
  dotFill,
  dotRadius = 4,
}: {
  targetDims: Record<string, number>;
  stroke: string;
  fill: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  dotFill?: string;
  dotRadius?: number;
}) {
  const prevPtsRef = useRef(dimsToPoints(targetDims));
  const [path, setPath] = useState(pointsToPath(dimsToPoints(targetDims)));
  const [dots, setDots] = useState(dimsToPoints(targetDims));

  const progress = useSpring(0, { stiffness: 120, damping: 24, mass: 0.8 });

  useEffect(() => {
    const from = [...prevPtsRef.current];
    const to = dimsToPoints(targetDims);
    // Snapshot target immediately so cleanup always captures latest
    prevPtsRef.current = to;

    progress.set(0);
    const unsubscribe = progress.on("change", (t) => {
      const pts = lerpPoints(from, to, t);
      setPath(pointsToPath(pts));
      setDots(pts);
    });

    progress.set(1);

    return () => {
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDims]);

  return (
    <g opacity={opacity}>
      <path
        d={path}
        stroke={stroke}
        fill={fill}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinejoin="round"
      />
      {dotFill &&
        dots.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={dotRadius}
            fill={dotFill}
            stroke="none"
          />
        ))}
    </g>
  );
}

const CustomTooltip = ({
  dim,
  value,
  compareValue,
  x,
  y,
}: {
  dim: (typeof DIMENSIONS)[0];
  value: number;
  compareValue?: number;
  x: number;
  y: number;
}) => {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ originX: x, originY: y }}
    >
      <rect
        x={x - 60}
        y={y - 38}
        width={120}
        height={compareValue !== undefined ? 52 : 40}
        rx={6}
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />
      <text x={x} y={y - 22} textAnchor="middle" fontSize={11} fontFamily="var(--font-display)" fill="hsl(var(--foreground))" fontWeight="600">
        {dim.icon} {dim.label}
      </text>
      <text x={x} y={y - 8} textAnchor="middle" fontSize={10} fontFamily="monospace" fill={value >= 0 ? "hsl(var(--positive))" : "hsl(var(--negative))"}>
        Current: {value > 0 ? "+" : ""}{value}
      </text>
      {compareValue !== undefined && (
        <text x={x} y={y + 6} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="hsl(210 85% 62%)">
          Previous: {compareValue > 0 ? "+" : ""}{compareValue}
        </text>
      )}
    </motion.g>
  );
};

export function ImpactRadar({ dimensions, compareData, svgRef }: ImpactRadarProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const n = DIMENSIONS.length;
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        {/* Ambient glow */}
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(43 95% 62% / 0.07)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={CX} cy={CY} r={R * 1.2} fill="url(#radar-glow)" />

        {/* Polar grid rings */}
        {rings.map((frac) =>
          DIMENSIONS.map((_, i) => {
            const angle1 = (2 * Math.PI * i) / n;
            const angle2 = (2 * Math.PI * ((i + 1) % n)) / n;
            const p1 = polarPoint(angle1, R * frac);
            const p2 = polarPoint(angle2, R * frac);
            return (
              <line
                key={`ring-${frac}-${i}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="hsl(218 22% 20%)"
                strokeWidth={frac === 1.0 ? 1.2 : 0.8}
                opacity={frac === 1.0 ? 0.8 : 0.5}
              />
            );
          })
        )}

        {/* Axis spokes */}
        {DIMENSIONS.map((_, i) => {
          const angle = (2 * Math.PI * i) / n;
          const end = polarPoint(angle, R);
          return (
            <line
              key={`spoke-${i}`}
              x1={CX}
              y1={CY}
              x2={end.x}
              y2={end.y}
              stroke="hsl(218 22% 18%)"
              strokeWidth={1}
            />
          );
        })}

        {/* Compare polygon (ghost) */}
        {compareData && (
          <AnimatedPolygon
            targetDims={compareData.dimensions}
            stroke="hsl(210 85% 62% / 0.5)"
            fill="hsl(210 85% 62% / 0.07)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        )}

        {/* Main polygon */}
        <AnimatedPolygon
          targetDims={dimensions}
          stroke="hsl(43 95% 62%)"
          fill="hsl(43 95% 62% / 0.1)"
          strokeWidth={2}
          dotFill="hsl(43 95% 62%)"
          dotRadius={4}
        />

        {/* Axis labels + hit areas */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (2 * Math.PI * i) / n;
          const labelR = R + 26;
          const lp = polarPoint(angle, labelR);
          const hitR = R + 14;
          const hp = polarPoint(angle, hitR);
          const isRight = lp.x > CX + 5;
          const isLeft = lp.x < CX - 5;
          const anchor = isRight ? "start" : isLeft ? "end" : "middle";
          const hovered = hoveredIdx === i;
          const val = dimensions[dim.key] ?? 0;
          const compareVal = compareData?.dimensions[dim.key];

          return (
            <g key={dim.key}>
              {/* Hit area circle */}
              <circle
                cx={hp.x}
                cy={hp.y}
                r={14}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text
                x={lp.x}
                y={lp.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fill={hovered ? `hsl(var(--${dim.color}))` : "hsl(var(--muted-foreground))"}
                fontWeight={hovered ? "700" : "400"}
                style={{ transition: "fill 0.2s" }}
              >
                {dim.icon} {dim.label}
              </text>

              {/* Hover tooltip */}
              {hovered && (
                <CustomTooltip
                  dim={dim}
                  value={val}
                  compareValue={compareData ? compareVal : undefined}
                  x={lp.x + (isRight ? -10 : isLeft ? 10 : 0)}
                  y={lp.y + (lp.y > CY ? 58 : -52)}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
