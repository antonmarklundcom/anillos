export type ImageProvenance =
  "supplier-authorized" | "owned-photo" | "illustrative";
export type ImageEvidence = {
  provenance?: ImageProvenance | null;
  verifiedAt?: Date | string | null;
};

/** Uploaded does not mean genuine or authorized. Legacy/unknown is fail-closed. */
export function verifiedProductImage(image: ImageEvidence): boolean {
  const stamp =
    image.verifiedAt instanceof Date
      ? image.verifiedAt.getTime()
      : typeof image.verifiedAt === "string"
        ? Date.parse(image.verifiedAt)
        : NaN;
  return (
    (image.provenance === "supplier-authorized" ||
      image.provenance === "owned-photo") &&
    Number.isFinite(stamp) &&
    stamp <= Date.now()
  );
}

export function merchantImages<T extends ImageEvidence>(
  images: readonly T[]
): T[] {
  return images.filter(verifiedProductImage);
}
