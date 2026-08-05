import { ChevronDownIcon } from "./Icons";

/**
 * Native <details> so it works without JavaScript and stays keyboard- and
 * screen-reader-friendly for free.
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
      <summary className="text-ink-900 flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium">
        {title}
        <ChevronDownIcon className="text-ink-400 size-4.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="text-ink-600 pb-5 text-sm leading-relaxed">{children}</div>
    </details>
  );
}
