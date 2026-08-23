import fp from "fastify-plugin";
import type { FastifyError, FastifyInstance } from "fastify";
import { isDomainError, sendDomainError, sendError } from "../errors";

export default fp(async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (isDomainError(error)) {
      return sendDomainError(reply, error);
    }

    if (error.validation) {
      return sendError(reply, 400, "validation_error", "Geçersiz istek.");
    }

    request.log.error({ err: error, reqId: request.id }, "unhandled_error");
    return sendError(reply, 500, "internal_error", "Beklenmeyen bir hata oluştu.");
  });

  app.setNotFoundHandler((_request, reply) => {
    return sendError(reply, 404, "not_found", "Kaynak bulunamadı.");
  });
});
