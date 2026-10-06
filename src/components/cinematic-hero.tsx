"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  HERO_DETAILS,
  HERO_MEDIA,
  type HomeHeroVariant,
} from "@/config/home-hero";

/** One photograph, one continuous camera move. The image and links are SSR. */
export function CinematicHero({
  variant = "portrait",
}: {
  variant?: HomeHeroVariant;
}) {
  const editorial = HERO_MEDIA[variant];
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);
  const detailIndex = useRef(0);
  const [detail, setDetail] = useState(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const element = track.current;
    const viewport = stage.current;
    const photo = image.current;
    if (!element || !viewport || !photo) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    let raf = 0;
    let visible = true;
    let allowed = false;
    let currentProgress = 0;
    let disposed = false;
    const reset = () => {
      photo.style.removeProperty("transform");
      progressBar.current?.style.removeProperty("transform");
    };
    const draw = () => {
      raf = 0;
      if (disposed || !allowed || !visible) return;
      const rect = element.getBoundingClientRect();
      // The actual stage determines the scroll distance, even on short screens.
      const pinned = getComputedStyle(viewport).position === "sticky";
      const distance = pinned
        ? rect.height - viewport.offsetHeight
        : viewport.offsetHeight * 0.65;
      const progress = pausedRef.current
        ? currentProgress
        : Math.max(0, Math.min(1, -rect.top / Math.max(1, distance)));
      currentProgress = progress;
      const eased = progress * progress * (3 - 2 * progress);
      const width = photo.clientWidth;
      const height = photo.clientHeight;
      if (!width || !height || !photo.naturalWidth) return;
      const cover =
        editorial.fit === "contain"
          ? Math.min(width / photo.naturalWidth, height / photo.naturalHeight)
          : Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
      // Locate the ring after object-fit cropping, then bring it to the centre.
      const x =
        (width - photo.naturalWidth * cover) / 2 +
        photo.naturalWidth * cover * editorial.focus[0];
      const y =
        (height - photo.naturalHeight * cover) / 2 +
        photo.naturalHeight * cover * editorial.focus[1];
      const zoom = 1 + (editorial.zoom - 1) * eased;
      const tx = Math.max(
        width * (1 - zoom),
        Math.min(0, -x * (zoom - 1) + (width / 2 - x) * eased)
      );
      const ty = Math.max(
        height * (1 - zoom),
        Math.min(0, -y * (zoom - 1) + (height / 2 - y) * eased)
      );
      photo.style.transform = `matrix(${zoom}, 0, 0, ${zoom}, ${tx}, ${ty})`;
      if (progressBar.current)
        progressBar.current.style.transform = `scaleX(${progress})`;
      const nextDetail = Math.min(2, Math.floor(progress * 3));
      if (detailIndex.current !== nextDetail) {
        detailIndex.current = nextDetail;
        setDetail(nextDetail);
      }
    };
    const schedule = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(draw);
    };
    const updatePreference = () => {
      // A high-priority image can fail before React hydrates and installs onError.
      if (photo.complete && photo.naturalWidth === 0) setFallback(true);
      allowed =
        !preference.matches &&
        !connection?.saveData &&
        photo.complete &&
        photo.naturalWidth > 0;
      setEnabled(allowed);
      if (!allowed) reset();
      else schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) schedule();
    });
    observer.observe(element);
    const resize = new ResizeObserver(schedule);
    resize.observe(viewport);
    resize.observe(photo);
    photo.addEventListener("load", updatePreference);
    photo.addEventListener("error", updatePreference);
    preference.addEventListener("change", updatePreference);
    connection?.addEventListener("change", updatePreference);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // A cached image needs no load event; defer the initial React update.
    raf = requestAnimationFrame(() => {
      raf = 0;
      updatePreference();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resize.disconnect();
      photo.removeEventListener("load", updatePreference);
      photo.removeEventListener("error", updatePreference);
      preference.removeEventListener("change", updatePreference);
      connection?.removeEventListener("change", updatePreference);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reset();
    };
  }, [editorial]);

  return (
    <section
      ref={track}
      className={`cinematic-track cinematic-${variant} ${enabled ? "motion-ready" : ""}`}
      aria-label={editorial.label}
      data-hero-variant={variant}
      data-motion-status={enabled ? (paused ? "paused" : "active") : "static"}
    >
      <div ref={stage} className="cinematic-stage">
        <div className="cinematic-media">
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={fallback ? editorial.fallback : editorial.mobile}
            />
            {/* Local WebP variants are pre-encoded; the browser selects one. */}
            <img
              ref={image}
              src={fallback ? editorial.fallback : editorial.poster}
              alt={editorial.alt}
              width={editorial.width}
              height={editorial.height}
              className={`hero-photo hero-photo-${editorial.fit}`}
              fetchPriority="high"
              decoding="async"
              onError={() => setFallback(true)}
            />
          </picture>
        </div>
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
          {variant === "rings" ? (
            <div className="hero-detail" aria-label="Detalles del anillo">
              <ol className="hero-detail-steps">
                {HERO_DETAILS.map((item, index) => (
                  <li
                    key={item.label}
                    aria-current={detail === index ? "step" : undefined}
                  >
                    <span>0{index + 1}</span> {item.label}
                  </li>
                ))}
              </ol>
              <p>{HERO_DETAILS[detail]?.text}</p>
            </div>
          ) : null}
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
          {enabled ? (
            <span className="motion-cue" aria-hidden="true">
              <span className="motion-rail">
                <span ref={progressBar} />
              </span>
              Deslizá para descubrir el detalle
            </span>
          ) : null}
          <a href="#colecciones">Ir a las colecciones ↓</a>
          {enabled ? (
            <button
              type="button"
              onClick={() => {
                pausedRef.current = !pausedRef.current;
                setPaused(pausedRef.current);
                if (!pausedRef.current)
                  window.dispatchEvent(new Event("scroll"));
              }}
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
