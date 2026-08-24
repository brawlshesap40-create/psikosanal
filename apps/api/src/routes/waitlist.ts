import type { FastifyInstance } from "fastify";
import { waitlistService } from "@psikosanal/core";

export default async function waitlistRoutes(app: FastifyInstance) {
  app.post(
    "/v1/psychologists/:id/waitlist",
    { preHandler: [app.authenticate, app.requireRole("danisan")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await waitlistService.joinWaitlist(request.user!.userId, Number(id));
      return reply.send(result);
    }
  );

  app.get(
    "/v1/psychologists/:id/waitlist",
    { preHandler: [app.authenticate, app.requireRole("danisan")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const onWaitlist = await waitlistService.isOnWaitlist(request.user!.userId, Number(id));
      return reply.send({ onWaitlist });
    }
  );
}
