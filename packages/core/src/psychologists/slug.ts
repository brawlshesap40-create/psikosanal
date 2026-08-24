import { eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { psychologistProfiles } from "@psikosanal/db/schema";

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generatePsychologistSlug(fullName: string) {
  const base = slugify(fullName) || "psikolog";
  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.query.psychologistProfiles.findFirst({
      where: eq(psychologistProfiles.slug, candidate),
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}
