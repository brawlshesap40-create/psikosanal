import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authService } from "@psikosanal/core";
import { registerDanisanSchema, loginSchema } from "@psikosanal/core/validation/auth";
import { parseBody } from "../validate";
import { isDomainError, sendDomainError, sendError } from "../errors";

const refreshSchema = z.object({ refreshToken: z.string().min(1) });
const updateMeSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().default(""),
});

function clientMeta(request: { headers: Record<string, unknown>; ip: string }) {
  return {
    userAgent: typeof request.headers["user-agent"] === "string" ? request.headers["user-agent"] : undefined,
    ip: request.ip,
  };
}

export default async function authRoutes(app: FastifyInstance) {
  app.post("/v1/auth/register/danisan", async (request, reply) => {
    try {
      const body = parseBody(registerDanisanSchema, request.body);
      const user = await authService.registerDanisan(body);
      const { tokens } = await authService.login({
        email: body.email,
        password: body.password,
        meta: clientMeta(request),
      });
      return reply.status(201).send({
        user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
        ...tokens,
      });
    } catch (error) {
      if (isDomainError(error)) return sendDomainError(reply, error);
      throw error;
    }
  });

  app.post("/v1/auth/login", async (request, reply) => {
    try {
      const body = parseBody(loginSchema, request.body);
      const { user, tokens } = await authService.login({
        ...body,
        meta: clientMeta(request),
      });
      return reply.send({
        user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
        ...tokens,
      });
    } catch (error) {
      if (isDomainError(error)) return sendDomainError(reply, error);
      throw error;
    }
  });

  app.post("/v1/auth/refresh", async (request, reply) => {
    try {
      const body = parseBody(refreshSchema, request.body);
      const tokens = await authService.refresh(body.refreshToken, clientMeta(request));
      return reply.send(tokens);
    } catch (error) {
      if (isDomainError(error)) return sendDomainError(reply, error);
      throw error;
    }
  });

  app.post(
    "/v1/auth/logout",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = parseBody(refreshSchema, request.body);
      await authService.logout(body.refreshToken);
      return reply.status(204).send();
    }
  );

  app.post(
    "/v1/auth/logout-all",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      await authService.logoutAll(request.user!.userId);
      return reply.status(204).send();
    }
  );

  app.get("/v1/auth/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    const me = await authService.getMe(request.user!.userId);
    if (!me) return sendError(reply, 404, "not_found", "Kullanıcı bulunamadı.");
    const { passwordHash: _passwordHash, ...safe } = me;
    return reply.send(safe);
  });

  app.patch("/v1/auth/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const body = parseBody(updateMeSchema, request.body);
      await authService.updateAccount(request.user!.userId, body);
      return reply.status(204).send();
    } catch (error) {
      if (isDomainError(error)) return sendDomainError(reply, error);
      throw error;
    }
  });
}
