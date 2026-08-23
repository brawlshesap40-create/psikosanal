import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";

export async function getFavoritePsychologistIds(clientId: number) {
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
