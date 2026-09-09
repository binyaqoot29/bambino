/**
 * Charts for the admin overview, drawn as plain SVG on the server.
 *
 * One hue — the brand's plum — because every chart here plots one series;
 * identity comes from labels, never from a colour key. Marks are thin, data
 * ends are rounded, gridlines are hairlines a step off the surface, and every
 * mark carries a native tooltip so a hover explains it without a script.
 */

type Point = { label: string; value: number; tooltip: string };

const MUTED = "var(--color-ink-400)";
const GRID = "var(--color-ink-200)";
const SERIES = "var(--color-brand-900)";

/** 0, 1,000, 2,000… — clean ticks that cover the maximum. */
function ticks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ??
    magnitude;
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) out.push(v);
  return out;
}

/**
 * A single-series area chart with a 2px line, a 10% wash, an end marker, and
 * one hit target per point for the tooltip.
 */
export function AreaChart({
  points,
  formatTick,
  height = 220,
  title,
}: {
  points: Point[];
  formatTick: (value: number) => string;
  height?: number;
  title: string;
}) {
  const width = 720;
  const pad = { top: 16, right: 20, bottom: 28, left: 56 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(...points.map((p) => p.value), 0);
  const scale = ticks(max);
  const top = scale[scale.length - 1] || 1;
  const x = (i: number) =>
    pad.left + (points.length > 1 ? (i / (points.length - 1)) * w : w / 2);
  const y = (v: number) => pad.top + h - (v / top) * h;

  const line = points
    .map(
      (p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const last = points[points.length - 1];
  // Label roughly every n-th day so the axis never crowds.
  const every = Math.max(1, Math.ceil(points.length / 8));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title}
      className="h-auto w-full"
    >
      {scale.map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={y(v)}
            y2={y(v)}
            stroke={GRID}
            strokeWidth="1"
          />
          <text
            x={pad.left - 10}
            y={y(v)}
            dy="0.35em"
            textAnchor="end"
            fontSize="11"
            fill={MUTED}
            className="tabular-nums"
          >
            {formatTick(v)}
          </text>
        </g>
      ))}
      {max > 0 ? <path d={area} fill={SERIES} fillOpacity="0.1" /> : null}
      <path
        d={line}
        fill="none"
        stroke={SERIES}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={p.label}>
          {i % every === 0 || i === points.length - 1 ? (
            <text
              x={x(i)}
              y={height - 8}
              textAnchor={
                i === points.length - 1 ? "end" : i === 0 ? "start" : "middle"
              }
              fontSize="11"
              fill={MUTED}
            >
              {p.label}
            </text>
          ) : null}
          {/* A hit target wider than the mark; the tooltip lives on it. */}
          <rect
            x={x(i) - (points.length > 1 ? w / (points.length - 1) / 2 : w / 2)}
            y={pad.top}
            width={points.length > 1 ? w / (points.length - 1) : w}
            height={h}
            fill="transparent"
            className="hover:fill-brand-900/5"
          >
            <title>{p.tooltip}</title>
          </rect>
        </g>
      ))}
      {last ? (
        <circle
          cx={x(points.length - 1)}
          cy={y(last.value)}
          r="5"
          fill={SERIES}
          stroke="var(--color-paper)"
          strokeWidth="2"
        />
      ) : null}
    </svg>
  );
}

/** Horizontal bars, value at the tip, one hue. */
export function BarList({
  rows,
  format,
  empty,
}: {
  rows: { label: string; value: number; tooltip?: string }[];
  format: (value: number) => string;
  empty: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 0);
  if (rows.length === 0 || max === 0) {
    return <p className="text-ink-400 py-6 text-center text-[13px]">{empty}</p>;
  }
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li
          key={row.label}
          title={row.tooltip ?? `${row.label}: ${format(row.value)}`}
        >
          <div className="flex items-baseline justify-between gap-4 text-[13px]">
            <span className="text-ink-800 truncate">{row.label}</span>
            <span className="text-ink-600 shrink-0 tabular-nums">
              {format(row.value)}
            </span>
          </div>
          <div className="bg-ink-100 mt-1.5 h-2 overflow-hidden rounded-full">
            <div
              className="bg-brand-900 h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-quint)]"
              style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A KPI tile: label, value, signed change against the previous window. */
export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  upIsGood = true,
}: {
  label: string;
  value: string;
  delta: number | null;
  deltaLabel: string;
  upIsGood?: boolean;
}) {
  const tone =
    delta === null || Math.abs(delta) < 0.5
      ? "text-ink-400"
      : delta > 0 === upIsGood
        ? "text-success"
        : "text-sale";
  const sign = delta === null ? "" : delta > 0 ? "+" : "";
  return (
    <div className="rounded-card bg-white p-5 shadow-[var(--shadow-soft)]">
      <p className="text-ink-500 text-[12px]">{label}</p>
      <p className="text-ink-900 mt-2 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className={`mt-1.5 text-[12px] tabular-nums ${tone}`}>
        {delta === null ? "—" : `${sign}${Math.round(delta)}%`}{" "}
        <span className="text-ink-400">{deltaLabel}</span>
      </p>
    </div>
  );
}
