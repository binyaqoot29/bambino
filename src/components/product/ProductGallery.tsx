"use client";

import { useState } from "react";

import { ProductArt } from "@/components/product/ProductArt";
import type { ArtKey } from "@/lib/catalog/types";

/**
 * The product page's images.
 *
 * With photographs it's a real gallery — thumbnails switch the main shot. With
 * none it falls back to the illustration, rendered once rather than as four
 * identical thumbnails: repeating the same drawing to imply a gallery is a
 * promise the page can't keep.
 */
export function ProductGallery({
  images,
  art,
  productId,
  label,
  thumbLabel,
}: {
  images: string[];
  art: ArtKey;
  productId: string;
  label: string;
  /** Accessible name for a thumbnail button, with {n} for its position. */
  thumbLabel: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (images.length === 0) {
    return (
      <ProductArt
        art={art}
        seed={productId}
        label={label}
        className="rounded-card aspect-[4/5] w-full"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      {images.length > 1 ? (
        <ul className="order-2 flex gap-3 sm:order-1 sm:flex-col">
          {images.map((image, index) => (
            <li key={image} className="flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={thumbLabel.replace("{n}", String(index + 1))}
                aria-current={index === active ? "true" : undefined}
                className={`block w-full overflow-hidden rounded-xl transition-[box-shadow,opacity] duration-200 sm:w-18 ${
                  index === active
                    ? "ring-ink-900 ring-1"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <ProductArt
                  art={art}
                  seed={productId}
                  src={image}
                  sizes="80px"
                  className="bg-canvas aspect-[4/5] w-full"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* The main shot must fit on screen without scrolling. The frame's height
          is capped to what fits under the header — 13rem covers the header,
          the announcement strip and the breadcrumbs — and its width follows
          the 4:5 proportion. The photo sits whole inside it on cream. */}
      <div className="order-1 min-w-0 flex-1 sm:order-2">
        <ProductArt
          art={art}
          seed={productId}
          src={current}
          label={label}
          priority
          fit="contain"
          sizes="(max-width: 640px) 100vw, 720px"
          className="bg-canvas rounded-card mx-auto aspect-[4/5] w-full max-w-[min(100%,calc((100dvh-13rem)*0.8))]"
        />
      </div>
    </div>
  );
}
