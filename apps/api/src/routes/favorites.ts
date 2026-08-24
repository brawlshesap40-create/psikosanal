import type { FastifyInstance } from "fastify";
import { favoritesService } from "@psikosanal/core";

export default async function favoritesRoutes(app: FastifyInstance) {
  app.get(
    "/v1/favorites",
    { preHandler: [app.authenticate, app.requireRole("danisan")] },
    async (request, reply) => {
      const favorites = await favoritesService.getFavoritesForClient(request.user!.userId);
      return reply.send({ favorites });
    }
  );

  app.post(
    "/v1/psychologists/:id/favorite",
    { preHandler: [app.authenticate, app.requireRole("danisan")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await favoritesService.toggleFavorite(request.user!.userId, Number(id));
      return reply.send(result);
    }
  );
}
