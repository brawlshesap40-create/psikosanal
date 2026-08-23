import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";

export async function getAllPayments() {
  return db.query.payments.findMany({
    orderBy: [desc(payments.createdAt)],
    with: {
      client: true,
      psychologist: { with: { user: true } },
    },
  });
}
