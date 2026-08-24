import type { FastifyInstance } from "fastify";
import { db } from "@psikosanal/db";
import { psychologistProfiles } from "@psikosanal/db/schema";
import { eq } from "drizzle-orm";
import { availabilityService } from "@psikosanal/core";
import { createSlotSchema } from "@psikosanal/core/validation/availability";
import { parseBody } from "../validate";
import { isDomainError, sendDomainError, sendError } from "../errors";

// Duplicated in apps/web/src/lib/availability/actions.ts's requireOwnPsychologistId
// pending the psychologists domain migration, which will give both a shared
// source of truth for "session user -> own psychologist profile id".
async function requireOwnPsychologistId(userId: number) {
  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, userId),
  });
  return profile?.id ?? null;
}

export default async function availabilityRoutes(app: FastifyInstance) {
  app.get("/v1/psychologists/:id/slots", async (request, reply) => {
    const { id } = request.params as { id: string };
    const slots = await availabilityService.getBookableSlots(Number(id));
    return reply.send({ slots });
  });

  app.post(
    "/v1/availability/slots",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const psychologistId = await requireOwnPsychologistId(request.user!.userId);
      if (!psychologistId) {
        return sendError(reply, 404, "not_found", "Psikolog profili bulunamadı.");
      }

      try {
        const body = parseBody(createSlotSchema, request.body);
        await availabilityService.createSlots(psychologistId, body);
        const slots = await availabilityService.getSlotsForPsychologist(psychologistId);
        return reply.status(201).send({ slots });
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }
    }
  );

  app.get(
    "/v1/availability/slots",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const psychologistId = await requireOwnPsychologistId(request.user!.userId);
      if (!psychologistId) {
        return sendError(reply, 404, "not_found", "Psikolog profili bulunamadı.");
      }
      const slots = await availabilityService.getSlotsForPsychologist(psychologistId);
      return reply.send({ slots });
    }
  );

  app.delete(
    "/v1/availability/slots/:id",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const psychologistId = await requireOwnPsychologistId(request.user!.userId);
      if (!psychologistId) {
        return sendError(reply, 404, "not_found", "Psikolog profili bulunamadı.");
      }
      const { id } = request.params as { id: string };
      await availabilityService.deleteSlot(psychologistId, Number(id));
      return reply.status(204).send();
    }
  );
}
