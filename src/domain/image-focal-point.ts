import { z } from "zod";
export const ImageFocalPointSchema = z
  .object({
    productId: z.number().int().positive(),
    imageId: z.number().int().positive(),
    focalPointX: z.number().int().min(0).max(100).nullable(),
    focalPointY: z.number().int().min(0).max(100).nullable(),
  })
  .strict()
  .refine(
    (value) => (value.focalPointX === null) === (value.focalPointY === null),
    "Elegí ambas coordenadas o restablecé el centro."
  );
