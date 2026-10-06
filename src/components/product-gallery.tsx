"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { src: string; alt: string; illustrative?: boolean };

export function ProductGallery({ images }: { images: readonly GalleryImage[] }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];
  if (!current) return null;
  return (
    <figure aria-label="Galería del producto">
      <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority={selected === 0}
          unoptimized={current.src.startsWith("https://")}
          sizes="(max-width: 1024px) 100vw, 550px"
          className="object-contain"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-3 gap-3" aria-label="Elegir imagen">
          {images.map((item, index) => (
            <button
              type="button"
              key={item.src}
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              aria-label={`Ver imagen ${index + 1}: ${item.alt}`}
              className="aria-pressed:border-foreground relative aspect-square overflow-hidden rounded-lg border-2 border-transparent focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(max-width: 640px) 30vw, 170px"
                unoptimized={item.src.startsWith("https://")}
                className="object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}
      {current.illustrative ? (
        <figcaption className="text-muted-foreground mt-3 text-xs leading-6">
          Imagen ilustrativa para preparar la galería. No representa este
          producto ni confirma su material, piedra o disponibilidad.
        </figcaption>
      ) : null}
    </figure>
  );
}
