import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function getUserById(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getAllDanisanUsers() {
  return db.query.users.findMany({
    where: eq(users.role, "danisan"),
    orderBy: [desc(users.createdAt)],
  });
}
