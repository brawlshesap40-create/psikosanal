import type { FastifyReply } from "fastify";
import { DomainError } from "@psikosanal/core";

export function sendError(
  reply: FastifyReply,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return reply.status(status).send({ error: { code, message, details } });
}

export function sendDomainError(reply: FastifyReply, error: DomainError) {
  return sendError(reply, error.status, error.code, error.message);
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
