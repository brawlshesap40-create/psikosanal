import type { FastifyInstance } from "fastify";
import { reviewsService } from "@psikosanal/core";
import { createReviewSchema } from "@psikosanal/core/validation/review";
import { parseBody } from "../validate";
import { isDomainError, sendDomainError } from "../errors";

export default async function reviewsRoutes(app: FastifyInstance) {
  app.get("/v1/psychologists/:id/reviews", async (request, reply) => {
    const { id } = request.params as { id: string };
    const [reviews, stats] = await Promise.all([
      reviewsService.getReviewsForPsychologist(Number(id)),
      reviewsService.getReviewStats(Number(id)),
    ]);
    return reply.send({ reviews, stats });
  });

  app.post(
    "/v1/reviews",
    { preHandler: [app.authenticate, app.requireRole("danisan")] },
    async (request, reply) => {
      try {
        const body = parseBody(createReviewSchema, request.body);
        await reviewsService.createReview(request.user!.userId, body);
        return reply.status(201).send();
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }
    }
  );

  app.post(
    "/v1/reviews/:id/approve",
    { preHandler: [app.authenticate, app.requireRole("admin")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await reviewsService.approveReview(Number(id));
      return reply.status(204).send();
    }
  );

  app.post(
    "/v1/reviews/:id/reject",
    { preHandler: [app.authenticate, app.requireRole("admin")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await reviewsService.rejectReview(Number(id));
      return reply.status(204).send();
    }
  );
}
