import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppSession } from "@psikosanal/core";

declare module "fastify" {
  interface FastifyRequest {
    user: AppSession | null;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      ...roles: AppSession["role"][]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
