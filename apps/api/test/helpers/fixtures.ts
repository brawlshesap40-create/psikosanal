import { db } from "@psikosanal/db";
import { psychologistProfiles, users } from "@psikosanal/db/schema";

let counter = 0;

export async function createPsychologist(overrides: Partial<typeof psychologistProfiles.$inferInsert> = {}) {
  counter += 1;
  const [user] = await db
    .insert(users)
    .values({
      email: `test.psikolog.${counter}@example.com`,
      passwordHash: "not-a-real-hash",
      role: "psikolog",
      fullName: `Test Psikolog ${counter}`,
    })
    .returning();

  const [profile] = await db
    .insert(psychologistProfiles)
    .values({
      userId: user.id,
      slug: `test-psikolog-${counter}`,
      title: "Klinik Psikolog",
      approvalStatus: "onaylandi",
      ...overrides,
    })
    .returning();

  return { user, profile };
}
