import type { FastifyInstance } from "fastify";
import { psychologistsService } from "@psikosanal/core";
import { psychologistProfileSchema } from "@psikosanal/core/validation/psychologist";
import { parseBody } from "../validate";
import { sendError } from "../errors";

export default async function psychologistsRoutes(app: FastifyInstance) {
  app.get("/v1/psychologists", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const result = await psychologistsService.getApprovedPsychologists({
      specialtySlug: query.specialtySlug,
      city: query.city,
      onlineOnly: query.onlineOnly === "true",
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      gender: query.gender,
      language: query.language,
      approach: query.approach,
      sort: query.sort as never,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    });
    return reply.send(result);
  });

  app.get("/v1/psychologists/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const psychologist = await psychologistsService.getPsychologistBySlug(slug);
    if (!psychologist) return sendError(reply, 404, "not_found", "Psikolog bulunamadı.");
    return reply.send(psychologist);
  });

  app.patch(
    "/v1/psychologists/me/profile",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const body = parseBody(psychologistProfileSchema, request.body);
      const updated = await psychologistsService.updateProfile(request.user!.userId, body);
      if (!updated) return sendError(reply, 404, "not_found", "Profil bulunamadı.");
      return reply.status(204).send();
    }
  );

  app.patch(
    "/v1/psychologists/me/photo",
    { preHandler: [app.authenticate, app.requireRole("psikolog")] },
    async (request, reply) => {
      const { photoUrl } = request.body as { photoUrl: string };
      await psychologistsService.updatePhoto(request.user!.userId, photoUrl);
      return reply.status(204).send();
    }
  );

  app.post(
    "/v1/psychologists/:id/approve",
    { preHandler: [app.authenticate, app.requireRole("admin")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await psychologistsService.approve(Number(id));
      return reply.status(204).send();
    }
  );

  app.post(
    "/v1/psychologists/:id/reject",
    { preHandler: [app.authenticate, app.requireRole("admin")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason: string };
      await psychologistsService.reject(Number(id), reason);
      return reply.status(204).send();
    }
  );
}
