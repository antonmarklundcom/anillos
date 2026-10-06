"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { src: string; alt: string; illustrative?: boolean };

export function ProductGallery({
  images,
}: {
  images: readonly GalleryImage[];
}) {
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const selected = Math.max(
    0,
    images.findIndex((item) => item.src === selectedSrc)
  );
  const current = images[selected];
  if (!current) return null;
  return (
    <figure className="product-gallery" aria-label="Galería del producto">
      <div className="product-gallery-stage">
        <span className="product-gallery-counter" aria-hidden="true">
          {String(selected + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </span>
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority={selected === 0}
          unoptimized={current.src.startsWith("https://")}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 720px"
          className="product-gallery-image"
        />
      </div>
      {images.length > 1 ? (
        <div className="product-gallery-thumbnails" aria-label="Elegir imagen">
          {images.map((item, index) => (
            <button
              type="button"
              key={item.src}
              onClick={() => setSelectedSrc(item.src)}
              aria-pressed={selected === index}
              aria-label={`Ver imagen ${index + 1}: ${item.alt}`}
              className="product-gallery-thumbnail"
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(max-width: 640px) 20vw, 110px"
                unoptimized={item.src.startsWith("https://")}
                className="product-gallery-image"
              />
            </button>
          ))}
        </div>
      ) : null}
      {current.illustrative ? (
        <figcaption className="product-gallery-caption">
          Imagen ilustrativa para preparar la galería. No representa este
          producto ni confirma su material, piedra o disponibilidad.
        </figcaption>
      ) : (
        <figcaption className="product-gallery-caption">
          Vista {selected + 1} de {images.length} · {current.alt}
        </figcaption>
      )}
    </figure>
  );
}
