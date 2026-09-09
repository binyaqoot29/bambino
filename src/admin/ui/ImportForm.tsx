"use client";

import { useActionState } from "react";

import type { ImportState } from "@/admin/actions";

type Labels = {
  file: string;
  checkOnly: string;
  run: string;
  checking: string;
  problemsTitle: string;
  missingColumns: string;
  line: string;
  checked: string;
  done: string;
  empty: string;
  tooLarge: string;
};

function fill(
  template: string,
  values: Record<string, string | number | undefined>,
) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? 0));
}

/** One CSV upload with a "check only" switch and a plain report underneath. */
export function ImportForm({
  id,
  action,
  labels,
}: {
  /** Distinguishes the file inputs when two forms share a page. */
  id: string;
  action: (state: ImportState, formData: FormData) => Promise<ImportState>;
  labels: Labels;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const imported =
    state.created !== undefined ||
    (state.kind === "inventory" && state.updated !== undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor={`file-${id}`}
          className="text-ink-700 block text-[12px] font-medium"
        >
          {labels.file}
        </label>
        <input
          id={`file-${id}`}
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="file:bg-ink-900 file:hover:bg-ink-800 text-ink-600 mt-2 block w-full text-sm file:me-3 file:h-10 file:rounded-full file:border-0 file:px-4 file:text-[13px] file:font-medium file:text-white"
        />
      </div>

      <label className="text-ink-700 flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="check"
          className="accent-brand-900 size-4"
        />
        {labels.checkOnly}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-900 hover:bg-brand-800 h-11 rounded-full px-6 text-[13px] font-medium text-white transition-colors duration-200 disabled:opacity-40"
      >
        {pending ? labels.checking : labels.run}
      </button>

      {state.error ? (
        <p role="alert" className="text-sale text-sm">
          {state.error === "size" ? labels.tooLarge : labels.empty}
        </p>
      ) : null}

      {state.missingColumns?.length ? (
        <p role="alert" className="text-sale text-sm">
          {labels.missingColumns}{" "}
          <code dir="ltr">{state.missingColumns.join(", ")}</code>
        </p>
      ) : null}

      {state.problems?.length ? (
        <div role="alert" className="bg-sale/8 rounded-xl p-4 text-sm">
          <p className="text-sale font-medium">{labels.problemsTitle}</p>
          <ul className="text-ink-700 mt-2 max-h-72 space-y-1 overflow-y-auto text-[13px]">
            {state.problems.map((p, i) => (
              <li key={i}>
                <span className="text-ink-400 tabular-nums">
                  {labels.line} {p.line}
                </span>{" "}
                <code dir="ltr" className="text-ink-900">
                  {p.handle}
                </code>
                : {p.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.checkedOnly &&
      !state.problems?.length &&
      !state.missingColumns?.length ? (
        <p role="status" className="text-success text-sm">
          {fill(labels.checked, { rows: state.rows })}
        </p>
      ) : null}

      {imported ? (
        <p role="status" className="text-success text-sm">
          {fill(labels.done, {
            rows: state.rows,
            created: state.created,
            updated: state.updated,
          })}
        </p>
      ) : null}
    </form>
  );
}
