/**
 * Stand-in product imagery.
 *
 * There is no product photography yet, so every product renders a line-art
 * illustration drawn in the same stroke language as the Bambino elephant. It
 * keeps the grid looking deliberate instead of showing broken image frames.
 * When real shots arrive, swap this component for <Image> at the call sites —
 * ProductCard, the PDP gallery, and the cart line item.
 */

import type { ArtKey } from "@/lib/catalog/types";

const S = {
  fill: "none",
  strokeWidth: 3.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ART: Record<ArtKey, React.ReactNode> = {
  bodysuit: (
    <>
      <path d="M45 28h30l11 18c2 4-1 8-5 6l-5-2v24c0 10-5 16-16 16s-16-6-16-16V50l-5 2c-4 2-7-2-5-6z" />
      <path d="M45 28c5 6 10 9 15 9s10-3 15-9" />
      <circle cx="54" cy="84" r="2.4" />
      <circle cx="60" cy="87" r="2.4" />
      <circle cx="66" cy="84" r="2.4" />
    </>
  ),
  dress: (
    <>
      <path d="M46 30h28l4 20H42z" />
      <path d="M46 30c4 6 9 9 14 9s10-3 14-9" />
      <path d="M46 30 35 44M74 30l11 14" />
      <path d="M42 50 32 88c18 7 38 7 56 0L78 50" />
      <path d="M36 74c16 5 32 5 48 0" />
    </>
  ),
  tee: (
    <>
      <path d="M44 32h32l16 12-9 11-7-6v39H44V49l-7 6-9-11z" />
      <path d="M44 32c5 7 10 10 16 10s11-3 16-10" />
    </>
  ),
  sleepsuit: (
    <>
      <path d="M45 22h30l11 17c2 4-1 8-5 6l-5-2v17l-3 42c0 3-2 5-5 5h-4c-3 0-5-2-5-5l-1-24-1 24c0 3-2 5-5 5h-4c-3 0-5-2-5-5l-3-42V43l-5 2c-4 2-7-2-5-6z" />
      <path d="M45 22c5 6 10 9 15 9s10-3 15-9" />
      <path d="M44 60h32" />
    </>
  ),
  stroller: (
    <>
      <path d="M30 62c0-19 12-30 30-30h14v30" />
      <path d="M26 62h62" />
      <path d="M88 62 98 38" />
      <path d="M42 62 34 86M74 62l8 24" />
      <circle cx="33" cy="93" r="7" />
      <circle cx="83" cy="93" r="7" />
      <path d="M46 44h20" />
    </>
  ),
  carseat: (
    <>
      <path d="M38 86c-8-26-4-42 8-50 12-8 30-6 38 4 6 7 6 16 6 24v22z" />
      <path d="M40 46c6-18 18-26 30-24 10 2 16 10 18 20" />
      <path d="M34 86h58" />
      <path d="M62 50v22M52 62h20" />
    </>
  ),
  cot: (
    <>
      <path d="M26 48c22-9 46-9 68 0" />
      <path d="M26 48v44M94 48v44M26 92h68" />
      <path d="M40 50v42M54 50v42M68 50v42M82 50v42" />
      <path d="M30 92v10M90 92v10" />
      <path d="M28 76h64" />
    </>
  ),
  bedding: (
    <>
      <path d="M28 46c20-10 44-10 64 0v30c-20 10-44 10-64 0z" />
      <path d="M28 60c20-9 44-9 64 0" />
      <path d="M40 52v26M60 50v28M80 52v26" />
      <path d="M28 76c20 10 44 10 64 0v10c-20 10-44 10-64 0z" />
    </>
  ),
  bottle: (
    <>
      <path d="M53 22c3-6 11-6 14 0v10H53z" />
      <path d="M48 32h24v8H48z" />
      <path d="M51 40h18c4 0 6 3 6 7v41c0 6-4 10-10 10H55c-6 0-10-4-10-10V47c0-4 2-7 6-7z" />
      <path d="M53 58h9M53 68h9M53 78h9" />
    </>
  ),
  highchair: (
    <>
      <path d="M42 28h28v34H42z" />
      <path d="M48 38h16M48 48h16" />
      <path d="M32 62h50" />
      <path d="M46 62 34 100M68 62l12 38" />
      <path d="M40 84h34" />
    </>
  ),
  teddy: (
    <>
      <circle cx="46" cy="24" r="8.5" />
      <circle cx="74" cy="24" r="8.5" />
      <circle cx="60" cy="38" r="17" />
      <path d="M54 34h.01M66 34h.01" strokeWidth="5" />
      <ellipse cx="60" cy="46" rx="8" ry="6" />
      <ellipse cx="60" cy="80" rx="18" ry="19" />
      <circle cx="38" cy="72" r="8.5" />
      <circle cx="82" cy="72" r="8.5" />
      <circle cx="49" cy="102" r="8.5" />
      <circle cx="71" cy="102" r="8.5" />
    </>
  ),
  booties: (
    <>
      <path d="M30 84c-2-18 2-28 12-28h8c5 0 8 3 11 8l7 11c4 5 10 7 16 8 5 1 8 4 8 9H30z" />
      <path d="M42 56c4 5 10 7 16 6" />
      <path d="M30 84h62" />
      <path d="M50 70c4 3 9 5 14 5" />
    </>
  ),
  bath: (
    <>
      <path d="M26 56h68v14c0 14-10 24-24 24H50c-14 0-24-10-24-24z" />
      <path d="M34 56c0-12 8-20 18-20" />
      <path d="M20 56h80" />
      <path d="M70 30c6 0 10 4 10 9 0 3-1 5-3 7" />
      <circle cx="74" cy="36" r="2.4" />
    </>
  ),
  bag: (
    <>
      <path d="M30 50h60l-5 48H35z" />
      <path d="M30 50h60v14H30z" />
      <path d="M46 50c0-12 6-18 14-18s14 6 14 18" />
      <path d="M52 76h16" />
    </>
  ),
};

/** Deterministic per-product background so a grid looks varied, not random. */
const SURFACES = [
  { bg: "from-brand-50 to-brand-100", ink: "text-brand-500" },
  { bg: "from-mint-50 to-mint-100", ink: "text-mint-600" },
  { bg: "from-brand-50 to-mint-50", ink: "text-brand-600" },
  { bg: "from-mint-100 to-brand-50", ink: "text-mint-700" },
] as const;

function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProductArt({
  art,
  seed,
  className = "",
  label,
}: {
  art: ArtKey;
  /** Usually the product id — picks the background tint. */
  seed: string;
  className?: string;
  label?: string;
}) {
  const surface = SURFACES[hash(seed) % SURFACES.length];

  return (
    <div
      className={`relative overflow-hidden bg-linear-to-br ${surface.bg} ${className}`}
    >
      {/* soft blobs, echoing the packaging */}
      <div
        aria-hidden="true"
        className="absolute -end-8 -top-10 size-32 rounded-full bg-white/45 blur-xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-12 -start-6 size-36 rounded-full bg-white/35 blur-xl"
      />
      <svg
        viewBox="0 0 120 120"
        className={`relative size-full ${surface.ink}`}
        role={label ? "img" : "presentation"}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        {label ? <title>{label}</title> : null}
        <g stroke="currentColor" {...S}>
          {ART[art]}
        </g>
      </svg>
    </div>
  );
}
