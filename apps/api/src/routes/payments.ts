import type { FastifyInstance } from "fastify";
import { paymentsService } from "@psikosanal/core";
import { isDomainError, sendDomainError } from "../errors";

// initiateBooking/initiatePackagePurchase stay apps/web-only actions: they
// need headers()/redirect() and return checkoutFormContent HTML meant for a
// Next form-action round-trip, not a good fit for a JSON API route.
export default async function paymentsRoutes(app: FastifyInstance) {
  app.post(
    "/v1/payments/:id/refund",
    { preHandler: [app.authenticate, app.requireRole("admin")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        await paymentsService.refundPayment(Number(id), { ip: request.ip });
        return reply.status(204).send();
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }
    }
  );
}
