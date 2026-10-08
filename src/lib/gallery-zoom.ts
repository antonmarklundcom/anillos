export type GalleryDimensions = { width: number; height: number };
/** Bounds use the actual object-contain drawing; scaling remains uniform. */
export function galleryPanBounds(
  container: GalleryDimensions,
  zoom: number,
  image?: GalleryDimensions
): { x: number; y: number } {
  const width = Math.max(0, container.width),
    height = Math.max(0, container.height);
  const factor = Math.max(1, Math.min(3, zoom));
  const fitted =
    image && image.width > 0 && image.height > 0
      ? Math.min(width / image.width, height / image.height)
      : null;
  const renderedWidth = fitted !== null && image ? image.width * fitted : width;
  const renderedHeight =
    fitted !== null && image ? image.height * fitted : height;
  return {
    x: Math.max(0, (renderedWidth * factor - width) / 2),
    y: Math.max(0, (renderedHeight * factor - height) / 2),
  };
}
