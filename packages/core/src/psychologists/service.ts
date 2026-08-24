import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { psychologistProfiles, psychologistSpecialties, reviews } from "@psikosanal/db/schema";
import type { psychologistProfileSchema } from "../validation/psychologist";
import type { z } from "zod";

export async function approve(psychologistId: number) {
  await db
    .update(psychologistProfiles)
    .set({ approvalStatus: "onaylandi", adminNote: null })
    .where(eq(psychologistProfiles.id, psychologistId));
}

export async function reject(psychologistId: number, reason: string) {
  await db
    .update(psychologistProfiles)
    .set({ approvalStatus: "reddedildi", adminNote: reason })
    .where(eq(psychologistProfiles.id, psychologistId));
}

export async function updateProfile(
  userId: number,
  input: z.infer<typeof psychologistProfileSchema>
) {
  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, userId),
  });
  if (!profile) return null;

  const { specialtyIds, ...rest } = input;

  await db.transaction(async (tx) => {
    await tx.update(psychologistProfiles).set(rest).where(eq(psychologistProfiles.id, profile.id));

    await tx
      .delete(psychologistSpecialties)
      .where(eq(psychologistSpecialties.psychologistId, profile.id));

    if (specialtyIds.length > 0) {
      await tx.insert(psychologistSpecialties).values(
        specialtyIds.map((specialtyId) => ({
          psychologistId: profile.id,
          specialtyId,
        }))
      );
    }
  });

  return profile;
}

export async function updatePhoto(userId: number, photoUrl: string) {
  await db
    .update(psychologistProfiles)
    .set({ photoUrl })
    .where(eq(psychologistProfiles.userId, userId));
}

export type PsychologistSort = "yeni" | "fiyat_artan" | "fiyat_azalan" | "puan";

export type PsychologistFilters = {
  specialtySlug?: string;
  city?: string;
  onlineOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  gender?: string;
  language?: string;
  approach?: string;
  sort?: PsychologistSort;
  page?: number;
  pageSize?: number;
};

export async function getApprovedPsychologists(filters: PsychologistFilters = {}) {
  const conditions = [eq(psychologistProfiles.approvalStatus, "onaylandi")];

  if (filters.city) conditions.push(eq(psychologistProfiles.city, filters.city));
  if (filters.onlineOnly) conditions.push(eq(psychologistProfiles.onlineAvailable, true));
  if (filters.minPrice !== undefined)
    conditions.push(gte(psychologistProfiles.sessionPriceTl, filters.minPrice));
  if (filters.maxPrice !== undefined)
    conditions.push(lte(psychologistProfiles.sessionPriceTl, filters.maxPrice));
  if (filters.gender)
    conditions.push(
      eq(psychologistProfiles.gender, filters.gender as (typeof psychologistProfiles.gender.enumValues)[number])
    );

  const all = await db.query.psychologistProfiles.findMany({
    where: and(...conditions),
    with: {
      specialties: { with: { specialty: true } },
      user: true,
    },
  });

  const ratingRows = await db
    .select({
      psychologistId: reviews.psychologistId,
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
    })
    .from(reviews)
    .where(eq(reviews.isApproved, true))
    .groupBy(reviews.psychologistId);
  const ratingById = new Map(ratingRows.map((row) => [row.psychologistId, Number(row.average)]));

  let filtered = all.filter((psychologist) => {
    if (
      filters.specialtySlug &&
      !psychologist.specialties.some((entry) => entry.specialty.slug === filters.specialtySlug)
    )
      return false;
    if (filters.language && !psychologist.languages.includes(filters.language)) return false;
    if (filters.approach && !psychologist.approaches.includes(filters.approach)) return false;
    return true;
  });

  const sort = filters.sort ?? "yeni";
  filtered = filtered.sort((a, b) => {
    if (sort === "fiyat_artan") return (a.sessionPriceTl ?? 0) - (b.sessionPriceTl ?? 0);
    if (sort === "fiyat_azalan") return (b.sessionPriceTl ?? 0) - (a.sessionPriceTl ?? 0);
    if (sort === "puan") return (ratingById.get(b.id) ?? 0) - (ratingById.get(a.id) ?? 0);
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const total = filtered.length;
  const pageSize = filters.pageSize ?? 12;
  const page = filters.page ?? 1;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize).map((psychologist) => ({
    ...psychologist,
    ratingAverage: ratingById.get(psychologist.id) ?? 0,
  }));

  return { items, total, page, pageSize };
}

export async function getPsychologistBySlug(slug: string) {
  return db.query.psychologistProfiles.findFirst({
    where: and(eq(psychologistProfiles.slug, slug), eq(psychologistProfiles.approvalStatus, "onaylandi")),
    with: {
      specialties: { with: { specialty: true } },
      user: true,
    },
  });
}

export async function getApprovedPsychologistSlugs() {
  const rows = await db
    .select({ slug: psychologistProfiles.slug, updatedAt: psychologistProfiles.updatedAt })
    .from(psychologistProfiles)
    .where(eq(psychologistProfiles.approvalStatus, "onaylandi"));
  return rows;
}

export async function getPsychologistById(id: number) {
  return db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, id),
    with: { user: true },
  });
}

export async function getPsychologistByUserId(userId: number) {
  return db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, userId),
    with: {
      specialties: { with: { specialty: true } },
    },
  });
}

export async function getPendingApplications() {
  return db.query.psychologistProfiles.findMany({
    where: eq(psychologistProfiles.approvalStatus, "beklemede"),
    orderBy: [desc(psychologistProfiles.createdAt)],
    with: { user: true },
  });
}

export async function getPsychologistApplicationById(id: number) {
  return db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, id),
    with: { user: true, specialties: { with: { specialty: true } } },
  });
}

export async function getAllPsychologists() {
  return db.query.psychologistProfiles.findMany({
    orderBy: [desc(psychologistProfiles.createdAt)],
    with: { user: true },
  });
}

export async function countPendingApplications() {
  const rows = await db
    .select({ id: psychologistProfiles.id })
    .from(psychologistProfiles)
    .where(eq(psychologistProfiles.approvalStatus, "beklemede"));
  return rows.length;
}
