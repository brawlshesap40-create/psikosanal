import type { FastifyInstance } from "fastify";
import { db } from "@psikosanal/db";
import { psychologistProfiles } from "@psikosanal/db/schema";
import { eq } from "drizzle-orm";
import { packagesService } from "@psikosanal/core";
import { createPackageSchema } from "@psikosanal/core/validation/package";
import { parseBody } from "../validate";
import { sendError } from "../errors";

// Duplicated in apps/web and apps/api/src/routes/availability.ts pending
// the psychologists domain migration (Phase 10).
async function requireOwnPsychologistId(userId: number) {
  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, userId),
  });
  return profile?.id ?? null;
}

export default async function packagesRoutes(app: FastifyInstance) {
  app.get("/v1/psychologists/:id/packages", async (request, reply) => {
    const { id } = request.params as { id: string };
    const packages = await packagesService.getActivePackagesForPsychologist(Number(id));
    return reply.send({ packages });
  });

  app.get(
    "/v1/packages",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const psychologistId = await requireOwnPsychologistId(request.user!.userId);
      if (!psychologistId) return sendError(reply, 404, "not_found", "Psikolog profili bulunamadı.");
      const packages = await packagesService.getPackagesForPsychologist(psychologistId);
      return reply.send({ packages });
    }
  );

  app.post(
    "/v1/packages",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const psychologistId = await requireOwnPsychologistId(request.user!.userId);
      if (!psychologistId) return sendError(reply, 404, "not_found", "Psikolog profili bulunamadı.");
      const body = parseBody(createPackageSchema, request.body);
      const created = await packagesService.createPackage(psychologistId, body);
      return reply.status(201).send(created);
    }
  );

  app.patch(
    "/v1/packages/:id",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const psychologistId = await requireOwnPsychologistId(request.user!.userId);
      if (!psychologistId) return sendError(reply, 404, "not_found", "Psikolog profili bulunamadı.");
      const { id } = request.params as { id: string };
      const { isActive } = request.body as { isActive: boolean };
      await packagesService.toggleActive(psychologistId, Number(id), isActive);
      return reply.status(204).send();
    }
  );
}
