import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { appointmentsService } from "@psikosanal/core";
import { parseBody } from "../validate";
import { isDomainError, sendDomainError } from "../errors";

const cancelSchema = z.object({ reason: z.string().trim().optional() });
const noShowSchema = z.object({ party: z.enum(["danisan", "psikolog"]) });

export default async function appointmentsRoutes(app: FastifyInstance) {
  app.get(
    "/v1/appointments/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const items =
        request.user!.role === "psikolog"
          ? await appointmentsService.getAppointmentsForPsychologist(request.user!.userId)
          : await appointmentsService.getAppointmentsForClient(request.user!.userId);
      return reply.send({ appointments: items });
    }
  );

  app.post(
    "/v1/appointments/:id/cancel",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const body = parseBody(cancelSchema, request.body ?? {});
        await appointmentsService.cancel(request.user!, Number(id), body.reason);
        return reply.status(204).send();
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }
    }
  );

  app.post(
    "/v1/appointments/:id/complete",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        await appointmentsService.markCompleted(request.user!.userId, Number(id));
        return reply.status(204).send();
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }
    }
  );

  app.post(
    "/v1/appointments/:id/no-show",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const body = parseBody(noShowSchema, request.body);
        await appointmentsService.markNoShow(request.user!.userId, Number(id), body.party);
        return reply.status(204).send();
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }
    }
  );
}
