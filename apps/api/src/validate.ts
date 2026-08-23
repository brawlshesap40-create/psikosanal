import type { ZodType } from "zod";
import { validationError } from "@psikosanal/core";

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw validationError(result.error.issues[0]?.message ?? "Geçersiz istek.");
  }
  return result.data;
}
