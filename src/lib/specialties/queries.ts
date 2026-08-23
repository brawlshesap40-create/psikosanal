import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { specialties } from "@/lib/db/schema";

export async function getAllSpecialties() {
  return db.query.specialties.findMany({
    orderBy: [asc(specialties.name)],
  });
}
