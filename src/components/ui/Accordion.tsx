import { ChevronDownIcon } from "./Icons";

/**
 * Native <details> so it works without JavaScript and stays keyboard- and
 * screen-reader-friendly for free. Hairline dividers, a serif title, and a
 * chevron that turns rather than a plus that flips — quieter.
 */
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="border-ink-200 group border-b [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="text-ink-900 font-display flex cursor-pointer list-none items-center justify-between py-5 text-lg">
        {title}
        <ChevronDownIcon className="text-ink-400 size-4.5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-open:rotate-180" />
      </summary>
      <div className="text-ink-600 pb-6 text-[15px] leading-relaxed">
        {children}
      </div>
    </details>
  );
}
