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
        className="aspect-square w-full rounded-lg"
      />
    );
  }

  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row">
      {images.length > 1 ? (
        <ul className="flex gap-2 sm:flex-col">
          {images.map((image, index) => (
            <li key={image} className="flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={thumbLabel.replace("{n}", String(index + 1))}
                aria-current={index === active ? "true" : undefined}
                className={`block w-full overflow-hidden rounded-md ring-1 sm:w-16 ${
                  index === active
                    ? "ring-brand-500 ring-2"
                    : "ring-ink-200 hover:ring-ink-300"
                }`}
              >
                <ProductArt
                  art={art}
                  seed={productId}
                  src={image}
                  sizes="64px"
                  className="aspect-square w-full"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* The main shot must fit on screen without scrolling. The frame is a
          square whose side is the column width or what fits under the
          header, whichever is smaller — 13rem covers the header, the
          announcement bar, the breadcrumbs and the card's padding. The photo
          sits whole inside it: cropping the main shot hides the product. */}
      <div className="min-w-0 flex-1">
        <ProductArt
          art={art}
          seed={productId}
          src={current}
          label={label}
          priority
          fit="contain"
          sizes="(max-width: 640px) 100vw, 720px"
          className="mx-auto aspect-square w-full max-w-[min(100%,calc(100dvh-13rem))] rounded-lg"
        />
      </div>
    </div>
  );
}
