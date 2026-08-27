import { desc, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { corporateLeads } from "@psikosanal/db/schema";
import type { corporateLeadSchema } from "../validation/corporate";
import type { z } from "zod";

export type CorporateLeadStatus = (typeof corporateLeads.$inferSelect)["status"];

export async function submitLead(input: z.infer<typeof corporateLeadSchema>) {
  const [created] = await db.insert(corporateLeads).values(input).returning();
  return created;
}

export async function listLeads() {
  return db.query.corporateLeads.findMany({ orderBy: [desc(corporateLeads.createdAt)] });
}

export async function updateLeadStatus(id: number, status: CorporateLeadStatus) {
  await db.update(corporateLeads).set({ status }).where(eq(corporateLeads.id, id));
}
