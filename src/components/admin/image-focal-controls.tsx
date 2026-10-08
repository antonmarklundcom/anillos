"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProductImageFocalPoint } from "@/app/actions/admin-image-focal";

export function ImageFocalControls({
  productId,
  imageId,
  src,
  x = null,
  y = null,
}: {
  productId: number;
  imageId: number;
  src: string | null;
  x?: number | null;
  y?: number | null;
}) {
  const [point, setPoint] = useState({ x: x ?? 50, y: y ?? 50 });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  function save(center = false) {
    startTransition(async () => {
      const result = await saveProductImageFocalPoint({
        productId,
        imageId,
        focalPointX: center ? null : point.x,
        focalPointY: center ? null : point.y,
      });
      setMessage(result.ok ? "Enfoque guardado." : result.error);
      if (result.ok) {
        if (center) setPoint({ x: 50, y: 50 });
        router.refresh();
      }
    });
  }
  return (
    <fieldset className="grid gap-2 border-t p-3">
      <legend className="text-sm">Encuadre de la tarjeta</legend>
      {src ? (
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={src}
            fill
            alt="Vista previa del encuadre"
            unoptimized
            sizes="200px"
            className="object-cover"
            style={{ objectPosition: `${point.x}% ${point.y}%` }}
          />
        </div>
      ) : null}
      <label className="text-xs">
        Horizontal: {point.x}%
        <input
          aria-label="Enfoque horizontal"
          className="w-full"
          type="range"
          min="0"
          max="100"
          step="1"
          value={point.x}
          onChange={(event) =>
            setPoint({ ...point, x: Number(event.target.value) })
          }
        />
      </label>
      <label className="text-xs">
        Vertical: {point.y}%
        <input
          aria-label="Enfoque vertical"
          className="w-full"
          type="range"
          min="0"
          max="100"
          step="1"
          value={point.y}
          onChange={(event) =>
            setPoint({ ...point, y: Number(event.target.value) })
          }
        />
      </label>
      <p className="text-muted-foreground text-xs">
        Solo cambia el encuadre. La fotografía completa sigue disponible en la
        ficha.
      </p>
      <button
        type="button"
        className="rounded border px-2 py-2 text-sm"
        disabled={pending}
        onClick={() => save()}
      >
        Guardar enfoque
      </button>
      <button
        type="button"
        className="rounded border px-2 py-2 text-sm"
        disabled={pending}
        onClick={() => save(true)}
      >
        Centrar imagen
      </button>
      <p role="status" className="text-xs">
        {message}
      </p>
    </fieldset>
  );
}
