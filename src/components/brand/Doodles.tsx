/**
 * The doodle vocabulary from the packaging and swing tags: clouds, little suns,
 * leaf sprigs, hatch marks, triangles and dots. Mint outlines on white, or
 * white/mint on plum.
 */

type DoodleProps = { className?: string };

export function Cloud({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <path
        d="M13 27c-5 0-9-3.6-9-8s4-8 9-8c.6 0 1.2.1 1.8.2C16.4 6.6 20.4 3.5 25 3.5c5.8 0 10.6 4.4 11.3 10.1 4 .5 7.2 3.9 7.2 8 0 4.1-3.4 7.4-7.5 7.4H13Z"
        fill="currentColor"
        fillOpacity="0.22"
      />
      <path
        d="M13 27c-5 0-9-3.6-9-8s4-8 9-8c.6 0 1.2.1 1.8.2C16.4 6.6 20.4 3.5 25 3.5c5.8 0 10.6 4.4 11.3 10.1 4 .5 7.2 3.9 7.2 8 0 4.1-3.4 7.4-7.5 7.4H13Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sun({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="7.5" fill="currentColor" fillOpacity="0.22" />
      <circle
        cx="20"
        cy="20"
        r="7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M20 3v6M20 31v6M3 20h6M31 20h6M8 8l4.2 4.2M27.8 27.8 32 32M32 8l-4.2 4.2M12.2 27.8 8 32" />
      </g>
    </svg>
  );
}

export function Sprig({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 44" className={className} aria-hidden="true">
      <path
        d="M12 42V6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M12 12c-3-1-5-3.5-5.5-6.5C9.5 6 11.5 8.5 12 12Z" />
        <path d="M12 12c3-1 5-3.5 5.5-6.5C14.5 6 12.5 8.5 12 12Z" />
        <path d="M12 21c-3-1-5-3.5-5.5-6.5C9.5 15 11.5 17.5 12 21Z" />
        <path d="M12 21c3-1 5-3.5 5.5-6.5C14.5 15 12.5 17.5 12 21Z" />
        <path d="M12 30c-3-1-5-3.5-5.5-6.5C9.5 24 11.5 26.5 12 30Z" />
        <path d="M12 30c3-1 5-3.5 5.5-6.5C14.5 24 12.5 26.5 12 30Z" />
      </g>
    </svg>
  );
}

export function Hatch({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 16" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M3 3v10M9 3v10M15 3v10M21 3v10M27 3v10" />
      </g>
    </svg>
  );
}

export function Triangle({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M16 4 4 10l12 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Dot({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="4" fill="currentColor" />
    </svg>
  );
}

/**
 * Seamless doodle field, matching the mailer boxes. Rendered as an inline
 * <svg> with a <pattern> so it stays crisp and needs no image request.
 */
export function DoodleField({
  className,
  id = "bambino-doodles",
  opacity = 1,
}: {
  className?: string;
  id?: string;
  opacity?: number;
}) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="100%"
      height="100%"
      opacity={opacity}
    >
      <defs>
        <pattern
          id={id}
          width="440"
          height="440"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(1.15) rotate(-4)"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* clouds */}
            <path d="M44 96c-6.6 0-12-4.8-12-10.7 0-5.9 5.4-10.7 12-10.7.8 0 1.6.1 2.4.3 2.1-5.9 7.6-9.9 13.7-9.9 7.7 0 14.1 5.9 15 13.4 5.3.7 9.4 5.2 9.4 10.6 0 5.5-4.5 10-10 10H44Z" />
            <path d="M268 200c-5.4 0-9.9-3.9-9.9-8.7s4.5-8.7 9.9-8.7c.7 0 1.3.1 2 .2 1.7-4.8 6.2-8 11.2-8 6.3 0 11.5 4.8 12.3 10.9 4.3.6 7.6 4.2 7.6 8.6s-3.6 8.1-8.1 8.1H268Z" />
            <path d="M96 350c-5.9 0-10.8-4.3-10.8-9.6s4.9-9.6 10.8-9.6c.7 0 1.4.1 2.1.3 1.9-5.3 6.8-8.9 12.3-8.9 6.9 0 12.7 5.3 13.5 12 4.7.6 8.4 4.7 8.4 9.4s-4 8.4-8.9 8.4H96Z" />
            {/* suns */}
            <circle cx="300" cy="72" r="13" />
            <path d="M300 43v10M300 91v10M271 72h10M319 72h10M280 52l7 7M313 85l7 7M320 52l-7 7M287 85l-7 7" />
            <circle cx="150" cy="248" r="10" />
            <path d="M150 226v7M150 263v7M128 248h7M165 248h7M134 232l5 5M161 259l5 5M166 232l-5 5M139 259l-5 5" />
            <circle cx="392" cy="318" r="11" />
            <path d="M392 294v8M392 334v8M368 318h8M408 318h8M375 301l6 6M403 329l6 6M409 301l-6 6M381 329l-6 6" />
            {/* sprigs */}
            <path d="M116 208v-56" />
            <path d="M116 166c-6-2.2-10.5-7.5-11.5-14 6.2 1.1 10.6 6.2 11.5 14ZM116 166c6-2.2 10.5-7.5 11.5-14-6.2 1.1-10.6 6.2-11.5 14ZM116 188c-6-2.2-10.5-7.5-11.5-14 6.2 1.1 10.6 6.2 11.5 14ZM116 188c6-2.2 10.5-7.5 11.5-14-6.2 1.1-10.6 6.2-11.5 14Z" />
            <path d="M338 420v-48" />
            <path d="M338 384c-5.2-1.9-9-6.5-9.9-12 5.3.9 9.1 5.3 9.9 12ZM338 384c5.2-1.9 9-6.5 9.9-12-5.3.9-9.1 5.3-9.9 12ZM338 404c-5.2-1.9-9-6.5-9.9-12 5.3.9 9.1 5.3 9.9 12ZM338 404c5.2-1.9 9-6.5 9.9-12-5.3.9-9.1 5.3-9.9 12Z" />
            {/* hatch marks */}
            <path d="M196 60v16M204 60v16M212 60v16M220 60v16" />
            <path d="M40 260v16M48 260v16M56 260v16M64 260v16" />
            <path d="M248 330v16M256 330v16M264 330v16M272 330v16" />
            <path d="M404 168v16M412 168v16M420 168v16" />
            {/* triangles */}
            <path d="M62 168 46 176l16 8" />
            <path d="M362 268l16-8-16-8" />
            <path d="M196 412l-16-8 16-8" />
          </g>
          <g fill="currentColor">
            <circle cx="176" cy="128" r="3.4" />
            <circle cx="80" cy="300" r="3.4" />
            <circle cx="320" cy="152" r="3.4" />
            <circle cx="236" cy="256" r="3.4" />
            <circle cx="410" cy="240" r="3.4" />
            <circle cx="136" cy="396" r="3.4" />
            <circle cx="292" cy="404" r="3.4" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
