/**
 * CSV in and out, the way spreadsheets actually write it.
 *
 * Excel and Numbers both quote fields with commas, double any quote inside a
 * quoted field, may end lines with CRLF, and Excel prefixes a UTF-8 BOM. The
 * parser accepts all of that; the writer produces it (BOM included, so Arabic
 * opens correctly in Excel without an import wizard).
 */

const BOM = "﻿";

function cell(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ""
      : value instanceof Date
        ? value.toISOString()
        : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Rows of cells → CSV text. The first row is the header. */
export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header.map(cell).join(",")];
  for (const row of rows) lines.push(row.map(cell).join(","));
  return BOM + lines.join("\r\n") + "\r\n";
}

/**
 * CSV text → header and rows. Rows come back as objects keyed by the header,
 * with cells trimmed. Blank lines are skipped. Header names are lowercased
 * and trimmed so "Name EN" and "name_en" both work.
 */
export function parseCsv(text: string): {
  header: string[];
  rows: Record<string, string>[];
} {
  const src = text.startsWith(BOM) ? text.slice(1) : text;
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      records.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    records.push(row);
  }

  const nonEmpty = records.filter((r) => r.some((v) => v.trim() !== ""));
  if (nonEmpty.length === 0) return { header: [], rows: [] };

  const header = nonEmpty[0].map((h) =>
    h.trim().toLowerCase().replace(/\s+/g, "_"),
  );
  const rows = nonEmpty.slice(1).map((r) => {
    const out: Record<string, string> = {};
    header.forEach((key, i) => {
      out[key] = (r[i] ?? "").trim();
    });
    return out;
  });
  return { header, rows };
}

/** A download response for a CSV file. */
export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
