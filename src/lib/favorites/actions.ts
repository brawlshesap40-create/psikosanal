"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";
import { verifyDanisanSession } from "@/lib/auth/dal";

export async function toggleFavoriteAction(psychologistId: number) {
  const session = await verifyDanisanSession();

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.clientId, session.userId), eq(favorites.psychologistId, psychologistId)),
  });

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
  } else {
    await db.insert(favorites).values({ clientId: session.userId, psychologistId });
  }

  revalidatePath("/psikologlar");
  revalidatePath("/danisan/favorilerim");
  return { isFavorite: !existing };
}
