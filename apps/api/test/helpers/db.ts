import { sql } from "drizzle-orm";
import { db } from "@psikosanal/db";

export async function truncateAll() {
  await db.execute(sql`TRUNCATE TABLE refresh_tokens, users RESTART IDENTITY CASCADE`);
}
