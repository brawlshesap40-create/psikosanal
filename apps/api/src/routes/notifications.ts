import type { FastifyInstance } from "fastify";
import { notificationsService } from "@psikosanal/core";

export default async function notificationsRoutes(app: FastifyInstance) {
  app.get("/v1/notifications", { preHandler: [app.authenticate] }, async (request, reply) => {
    const [items, unread] = await Promise.all([
      notificationsService.getForUser(request.user!.userId),
      notificationsService.countUnread(request.user!.userId),
    ]);
    return reply.send({ items, unread });
  });

  app.post(
    "/v1/notifications/:id/read",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await notificationsService.markRead(request.user!.userId, Number(id));
      return reply.status(204).send();
    }
  );

  app.post(
    "/v1/notifications/read-all",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      await notificationsService.markAllRead(request.user!.userId);
      return reply.status(204).send();
    }
  );
}
