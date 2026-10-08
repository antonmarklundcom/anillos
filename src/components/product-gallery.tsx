"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { galleryPanBounds } from "@/lib/gallery-zoom";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type GalleryImage = {
  src: string;
  alt: string;
  illustrative?: boolean;
  evidencePending?: boolean;
  thumbnailSrc?: string;
  focalPointX?: number | null;
  focalPointY?: number | null;
};

export function ProductGallery({
  images,
}: {
  images: readonly GalleryImage[];
}) {
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentPanBounds = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return { x: 0, y: 0 };
    const box = viewport.getBoundingClientRect();
    const image = viewport.querySelector("img");
    return galleryPanBounds({ width: box.width, height: box.height }, zoom, {
      width: image?.naturalWidth ?? 0,
      height: image?.naturalHeight ?? 0,
    });
  }, [zoom]);
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setDrag(null);
  };
  const shiftPan = (x: number, y: number) => {
    const bounds = currentPanBounds();
    setPan((value) => ({
      x: Math.max(-bounds.x, Math.min(bounds.x, value.x + x)),
      y: Math.max(-bounds.y, Math.min(bounds.y, value.y + y)),
    }));
  };
  const selected = Math.max(
    0,
    images.findIndex((item) => item.src === selectedSrc)
  );
  const current = images[selected];
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const bounds = currentPanBounds();
      setPan((value) => ({
        x: Math.max(-bounds.x, Math.min(bounds.x, value.x)),
        y: Math.max(-bounds.y, Math.min(bounds.y, value.y)),
      }));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [currentPanBounds, current?.src, open]);
  if (!current) return null;
  function move(delta: number) {
    resetZoom();
    const next = images[(selected + delta + images.length) % images.length];
    if (next) setSelectedSrc(next.src);
  }
  return (
    <figure className="product-gallery" aria-label="Galería del producto">
      <Dialog
        onOpenChange={(value) => {
          setOpen(value);
          resetZoom();
        }}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className="product-gallery-zoom-trigger"
            aria-label={`Ampliar imagen ${selected + 1}: ${current.alt}`}
          >
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
                style={{
                  objectPosition: `${current.focalPointX ?? 50}% ${current.focalPointY ?? 50}%`,
                }}
              />
              <span className="product-gallery-zoom-label">Ampliar imagen</span>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="product-gallery-zoom motion-reduce:animate-none motion-reduce:duration-0"
          onKeyDown={(event) => {
            if (event.key === "+" || event.key === "=") {
              event.preventDefault();
              setZoom((value) => Math.min(3, value + 0.5));
              return;
            }
            if (event.key === "-") {
              event.preventDefault();
              setZoom((value) => Math.max(1, value - 0.5));
              setPan({ x: 0, y: 0 });
              return;
            }
            if (event.key === "0") {
              event.preventDefault();
              resetZoom();
              return;
            }
            if (zoom > 1 && event.key.startsWith("Arrow")) {
              event.preventDefault();
              shiftPan(
                event.key === "ArrowLeft"
                  ? -30
                  : event.key === "ArrowRight"
                    ? 30
                    : 0,
                event.key === "ArrowUp"
                  ? -30
                  : event.key === "ArrowDown"
                    ? 30
                    : 0
              );
              return;
            }
            if (images.length < 2) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              move(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>
              Imagen {selected + 1} de {images.length}
            </DialogTitle>
            <DialogClose className="rounded border px-3 py-2">
              Cerrar
            </DialogClose>
          </div>
          <DialogDescription>
            {current.evidencePending
              ? "Imagen con origen o permiso de uso pendiente de verificación."
              : current.illustrative
                ? "Imagen ilustrativa; las características de una pieza real requieren confirmación."
                : current.alt}
          </DialogDescription>
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Controles de ampliación"
          >
            <button
              type="button"
              className="rounded border px-3 py-2"
              disabled={zoom === 3}
              onClick={() => setZoom((value) => Math.min(3, value + 0.5))}
            >
              Acercar +
            </button>
            <button
              type="button"
              className="rounded border px-3 py-2"
              disabled={zoom === 1}
              onClick={() => {
                setZoom((value) => Math.max(1, value - 0.5));
                setPan({ x: 0, y: 0 });
              }}
            >
              Alejar −
            </button>
            <button
              type="button"
              className="rounded border px-3 py-2"
              onClick={resetZoom}
            >
              Restablecer
            </button>
            <span role="status">{Math.round(zoom * 100)}%</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Usá +, − y 0. Al ampliar, arrastrá la imagen o usá las flechas para
            desplazarla.
          </p>
          <div
            ref={viewportRef}
            className="product-gallery-zoom-image overflow-hidden"
            style={{ touchAction: zoom > 1 ? "none" : "auto" }}
            onPointerDown={(event) => {
              if (zoom <= 1) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              setDrag({ x: event.clientX, y: event.clientY });
            }}
            onPointerMove={(event) => {
              if (!drag || zoom <= 1) return;
              shiftPan(event.clientX - drag.x, event.clientY - drag.y);
              setDrag({ x: event.clientX, y: event.clientY });
            }}
            onPointerUp={() => setDrag(null)}
            onPointerCancel={() => setDrag(null)}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="95vw"
              unoptimized={current.src.startsWith("https://")}
              className="object-contain"
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            />
          </div>
          {images.length > 1 ? (
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => move(-1)}
                className="rounded border px-3 py-2"
              >
                Imagen anterior
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="rounded border px-3 py-2"
              >
                Imagen siguiente
              </button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      {images.length > 1 ? (
        <div className="product-gallery-thumbnails" aria-label="Elegir imagen">
          {images.map((item, index) => (
            <button
              type="button"
              key={item.src}
              onClick={() => {
                resetZoom();
                setSelectedSrc(item.src);
              }}
              aria-pressed={selected === index}
              aria-label={`Ver imagen ${index + 1}: ${item.alt}`}
              className="product-gallery-thumbnail"
            >
              <Image
                src={item.thumbnailSrc ?? item.src}
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
      {current.evidencePending ? (
        <figcaption className="product-gallery-caption">
          Imagen con origen o permiso de uso pendiente de verificación. No
          acredita las características del producto.
        </figcaption>
      ) : current.illustrative ? (
        <figcaption className="product-gallery-caption">
          Imagen ilustrativa; las características de una pieza real requieren
          confirmación.
        </figcaption>
      ) : (
        <figcaption className="product-gallery-caption">
          Vista {selected + 1} de {images.length} · {current.alt}
        </figcaption>
      )}
    </figure>
  );
}
