import { describe, expect, it, vi } from "vitest";
import {
  readProductImages,
  productImageFocalMigrationMissing,
} from "@/db/product-image-compat";
import type { Executor } from "@/domain/executor";

describe("image compatibility error boundaries", () => {
  it("recognises only missing-column errors, including a Drizzle cause", () => {
    expect(
      productImageFocalMigrationMissing({
        cause: { code: "ER_BAD_FIELD_ERROR" },
      })
    ).toBe(true);
    expect(
      productImageFocalMigrationMissing({ code: "ER_NO_SUCH_TABLE" })
    ).toBe(false);
    expect(
      productImageFocalMigrationMissing(new Error("Connection failed"))
    ).toBe(false);
  });
  it("propagates genuine database errors without retrying a legacy read", async () => {
    const failure = new Error("Connection failed");
    const orderBy = vi.fn().mockRejectedValue(failure);
    const select = vi.fn(() => ({
      from: () => ({ where: () => ({ orderBy }) }),
    }));
    await expect(
      readProductImages({ select } as unknown as Executor, [1])
    ).rejects.toBe(failure);
    expect(select).toHaveBeenCalledTimes(1);
  });
});
