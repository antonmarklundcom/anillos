import Image from "next/image";

export function EditorialImage({
  asset,
  alt,
  priority = false,
  className = "",
}: {
  asset: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`editorial-image ${className}`}>
      <Image
        src={`/media/${asset}.webp`}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
        priority={priority}
        className="object-cover"
      />
      <figcaption>Imagen ilustrativa · IA</figcaption>
    </figure>
  );
}
