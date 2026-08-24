import type { FastifyInstance } from "fastify";
import { conversationsService } from "@psikosanal/core";
import { sendMessageSchema } from "@psikosanal/core/validation/message";
import { parseBody } from "../validate";
import { isDomainError, sendDomainError } from "../errors";

export default async function conversationsRoutes(app: FastifyInstance) {
  app.get(
    "/v1/conversations/:clientId/:psychologistId/messages",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { clientId, psychologistId } = request.params as {
        clientId: string;
        psychologistId: string;
      };
      try {
        await conversationsService.requireParticipant(
          request.user!,
          Number(clientId),
          Number(psychologistId)
        );
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }

      const conversation = await conversationsService.getConversationBetween(
        Number(clientId),
        Number(psychologistId)
      );
      const messages = conversation
        ? await conversationsService.getMessages(conversation.id)
        : [];
      return reply.send({ messages });
    }
  );

  app.post(
    "/v1/conversations/:clientId/:psychologistId/messages",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { clientId, psychologistId } = request.params as {
        clientId: string;
        psychologistId: string;
      };

      try {
        await conversationsService.requireParticipant(
          request.user!,
          Number(clientId),
          Number(psychologistId)
        );
        const body = parseBody(sendMessageSchema, request.body);
        await conversationsService.sendMessage({
          clientId: Number(clientId),
          psychologistId: Number(psychologistId),
          senderId: request.user!.userId,
          senderRole: request.user!.role,
          body: body.body,
        });
        return reply.status(204).send();
      } catch (error) {
        if (isDomainError(error)) return sendDomainError(reply, error);
        throw error;
      }
    }
  );
}
