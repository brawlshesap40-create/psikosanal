import { sql } from "drizzle-orm";
import { db } from "@psikosanal/db";

export async function truncateAll() {
  await db.execute(
    sql`TRUNCATE TABLE refresh_tokens, notifications, favorites, waitlist_entries, psychologist_profiles, users RESTART IDENTITY CASCADE`
  );
}
