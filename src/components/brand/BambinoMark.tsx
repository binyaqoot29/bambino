/**
 * The Bambino elephant.
 *
 * Redrawn as vector from the mockups in docs/Bambino-brand-identity.pdf — the
 * deck ships the mark only as flattened artwork inside photography, so this is
 * a reconstruction. If the original .ai/.svg turns up, swap the paths here and
 * nothing else needs to change.
 *
 * Uniform stroke, round caps and joins, drawn on a 240×165 grid.
 */

type MarkProps = {
  /** Stroke + leaf colour. Defaults to `currentColor` so it inherits. */
  color?: string;
  /** Leaf sprig colour, when it should differ from the line. */
  leafColor?: string;
  className?: string;
  title?: string;
};

const STROKE = 7;

export function BambinoMark({
  color = "currentColor",
  leafColor,
  className,
  title,
}: MarkProps) {
  return (
    <svg
      viewBox="38 20 166 136"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <g
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* head, forehead, and the trunk curling up to the leaves */}
        <path d="M100 33C108 28 118 26 128 27C142 29 152 36 158 47C163 57 164 68 162 79C160 90 156 96 153 100C157 106 164 110 171 111C180 111 187 106 190 98C193 90 192 84 188 80" />
        {/* ear */}
        <path d="M126 52C126 42 126 35 125 31C118 27 108 28 100 33C91 39 85 48 83 59C81 70 83 81 88 88C93 94 101 97 109 95C117 93 122 86 124 78" />
        {/* inner ear fold */}
        <path d="M93 74C87 76 83 82 82 89C81 97 86 103 94 105C103 107 112 105 117 99" />
        {/* back, rump, hind leg, belly arch, foreleg, chest */}
        <path d="M81 58C72 63 65 72 61 83C57 94 56 105 58 116C60 127 66 137 74 144C79 148 85 147 88 141C91 134 94 126 99 121C104 121 107 128 110 136C113 143 117 148 123 147C129 146 133 139 134 130C135 120 135 110 136 102C137 96 139 92 143 88" />
        {/* tail */}
        <path d="M58 100C54 105 50 109 46 113" />
        {/* jaw */}
        <path d="M143 88C146 94 149 99 153 101" />
        {/* eye, closed and happy */}
        <path d="M137 72C139 67 144 66 147 70" />
      </g>
      <g fill={leafColor ?? color}>
        <path d="M182 48C187 53 187 61 182 67C177 61 177 53 182 48Z" />
        <path d="M168 57C175 57 181 62 182 69C175 70 169 65 168 57Z" />
        <path d="M196 57C196 65 190 70 183 69C184 62 189 57 196 57Z" />
      </g>
    </svg>
  );
}
