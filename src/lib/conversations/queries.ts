import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";

export async function getConversationsForClient(clientId: number) {
  return db.query.conversations.findMany({
    where: eq(conversations.clientId, clientId),
    orderBy: [desc(conversations.lastMessageAt)],
    with: { psychologist: { with: { user: true } } },
  });
}

export async function getConversationsForPsychologist(psychologistId: number) {
  return db.query.conversations.findMany({
    where: eq(conversations.psychologistId, psychologistId),
    orderBy: [desc(conversations.lastMessageAt)],
    with: { client: true },
  });
}

export async function getConversationBetween(
  clientId: number,
  psychologistId: number
) {
  return db.query.conversations.findFirst({
    where: and(
      eq(conversations.clientId, clientId),
      eq(conversations.psychologistId, psychologistId)
    ),
  });
}

export async function getMessages(conversationId: number) {
  return db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt)],
  });
}
