"use client";

/**
 * next/image loader backed by Supabase Storage's image transformations.
 *
 * A product photo is stored once, at full detail, under
 * `/storage/v1/object/public/…`. Every place the shop shows it asks for the
 * width that slot actually needs — a 64px thumbnail, a 260px card, a 520px
 * gallery frame — and Supabase resizes on the fly at `/storage/v1/render/
 * image/public/…`, serving WebP to browsers that accept it. The original is
 * never sent to a visitor unless a slot is genuinely that large.
 *
 * Anything that is not a Supabase Storage object URL (a `blob:` preview in
 * the admin, `/icon.svg`, a local `public/uploads/` file in dev) is returned
 * untouched: there is nothing to transform and no service to send it to.
 *
 * Quality 82 is the point where the encoder stops removing detail a person
 * can see in a product photo; lower saves little and starts to soften edges.
 */
const OBJECT_PREFIX = "/storage/v1/object/public/";
const RENDER_PREFIX = "/storage/v1/render/image/public/";
export const DEFAULT_QUALITY = 82;

export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.startsWith("https://") || !src.includes(".supabase.co" + OBJECT_PREFIX)) {
    return src;
  }
  const render = src.replace(OBJECT_PREFIX, RENDER_PREFIX);
  const q = Math.min(100, Math.max(20, quality ?? DEFAULT_QUALITY));
  return `${render}?width=${width}&quality=${q}`;
}
