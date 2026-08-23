import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { verifyAccessToken, type AppSession } from "@psikosanal/core";
import { sendError } from "../errors";

export default fp(async function authPlugin(app: FastifyInstance) {
  app.decorateRequest("user", null);

  app.decorate("authenticate", async (request, reply) => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) {
      return sendError(reply, 401, "unauthorized", "Bir erişim jetonu (access token) gerekli.");
    }

    const session = await verifyAccessToken(token);
    if (!session) {
      return sendError(reply, 401, "unauthorized", "Geçersiz veya süresi dolmuş jeton.");
    }

    request.user = session;
  });

  app.decorate("requireRole", (...roles: AppSession["role"][]) => {
    return async (request, reply) => {
      if (!request.user || !roles.includes(request.user.role)) {
        return sendError(reply, 403, "forbidden", "Bu işlem için yetkiniz yok.");
      }
    };
  });
});
