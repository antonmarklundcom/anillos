"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Optional, progressive motion; the poster and all navigation are SSR. */
export function CinematicHero() {
  const track = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const network = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (media.matches || network.connection?.saveData || paused) return;
    let disposed = false;
    let raf = 0;
    let timeout = 0;
    const frames = new Map<number, HTMLImageElement>();
    const mobile = window.innerWidth < 768;
    const draw = () => {
      raf = 0;
      const element = track.current;
      const target = canvas.current;
      if (!element || !target || disposed) return;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight))
      );
      const index = Math.round(progress * 47) + 1;
      const image = frames.get(index) ?? frames.get(1);
      if (!image) return;
      const ctx = target.getContext("2d");
      if (!ctx) return;
      const width = target.clientWidth;
      const height = target.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (
        target.width !== Math.round(width * dpr) ||
        target.height !== Math.round(height * dpr)
      ) {
        target.width = Math.round(width * dpr);
        target.height = Math.round(height * dpr);
      }
      const scale = Math.max(
        target.width / image.width,
        target.height / image.height
      );
      ctx.drawImage(
        image,
        (target.width - image.width * scale) / 2,
        (target.height - image.height * scale) / 2,
        image.width * scale,
        image.height * scale
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const load = async () => {
      // Small batches keep the network available for the rest of the store.
      for (let batch = 1; batch <= 48 && !disposed; batch += 4) {
        await Promise.all(
          Array.from(
            { length: Math.min(4, 49 - batch) },
            (_, offset) =>
              new Promise<void>((resolve) => {
                const index = batch + offset;
                const image = new window.Image();
                image.onload = () => {
                  if (!disposed) {
                    frames.set(index, image);
                    if (index === 1) setEnabled(true);
                    schedule();
                  }
                  resolve();
                };
                image.onerror = () => resolve();
                image.src = `/media/frames/${mobile ? "mobile" : "desktop"}/${String(index).padStart(3, "0")}.webp`;
              })
          )
        );
      }
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        timeout = window.setTimeout(() => void load(), 700);
        observer.disconnect();
      }
    });
    if (track.current) observer.observe(track.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const preferenceChanged = () => {
      if (media.matches) {
        disposed = true;
        setEnabled(false);
      }
    };
    media.addEventListener("change", preferenceChanged);
    return () => {
      disposed = true;
      observer.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", preferenceChanged);
    };
  }, [paused]);
  return (
    <section
      ref={track}
      className={`cinematic-track ${enabled ? "motion-ready" : ""}`}
      aria-label="Una historia en tres metales"
    >
      <div className="cinematic-stage">
        <Image
          src="/media/frames/desktop/001.webp"
          alt="Tres conceptos de anillos sobre piedra y lino claros"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <canvas
          ref={canvas}
          aria-hidden="true"
          className={enabled ? "visible" : "invisible"}
        />
        <div className="cinematic-shade" />
        <div className="cinematic-copy">
          <p className="eyebrow">Anillos en Paraguay</p>
          <h1>
            Pequeños detalles.
            <br />
            <em>Grandes historias.</em>
          </h1>
          <p>
            De un anillo para todos los días a unas alianzas para los dos.
            Encontrá tu estilo, empezá por tu presupuesto.
          </p>
          <div className="hero-actions">
            <Link href="/categoria/acero" className="store-button">
              Explorá opciones accesibles ↗
            </Link>
            <Link href="#colecciones" className="text-link">
              Ver colecciones →
            </Link>
          </div>
          <span className="hero-note">
            Catálogo conceptual · compras aún no habilitadas
          </span>
        </div>
        <div className="motion-controls">
          <span>Editorial ilustrativo · IA</span>
          <a href="#colecciones">Ir a las colecciones ↓</a>
          {enabled ? (
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
            >
              {paused ? "Activar movimiento" : "Pausar movimiento"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
