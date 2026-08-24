import { and, desc, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { favorites } from "@psikosanal/db/schema";

export async function toggleFavorite(clientId: number, psychologistId: number) {
  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.clientId, clientId), eq(favorites.psychologistId, psychologistId)),
  });

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
  } else {
    await db.insert(favorites).values({ clientId, psychologistId });
  }

  return { isFavorite: !existing };
}

export async function getFavoriteIds(clientId: number) {
  const rows = await db
    .select({ psychologistId: favorites.psychologistId })
    .from(favorites)
    .where(eq(favorites.clientId, clientId));
  return new Set(rows.map((row) => row.psychologistId));
}

export async function getFavoritesForClient(clientId: number) {
  return db.query.favorites.findMany({
    where: eq(favorites.clientId, clientId),
    orderBy: [desc(favorites.createdAt)],
    with: {
      psychologist: { with: { user: true, specialties: { with: { specialty: true } } } },
    },
  });
}
