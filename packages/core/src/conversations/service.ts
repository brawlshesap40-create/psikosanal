import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { conversations, messages, psychologistProfiles } from "@psikosanal/db/schema";
import { createNotification } from "../notifications/service";
import { forbidden } from "../auth/errors";
import type { UserRole } from "../auth/session-types";

export async function requireParticipant(
  session: { userId: number; role: UserRole },
  clientId: number,
  psychologistId: number
) {
  if (session.role === "danisan" && session.userId === clientId) return;

  if (session.role === "psikolog") {
    const profile = await db.query.psychologistProfiles.findFirst({
      where: eq(psychologistProfiles.userId, session.userId),
    });
    if (profile && profile.id === psychologistId) return;
  }

  throw forbidden();
}

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

export async function getConversationBetween(clientId: number, psychologistId: number) {
  return db.query.conversations.findFirst({
    where: and(eq(conversations.clientId, clientId), eq(conversations.psychologistId, psychologistId)),
  });
}

export async function getMessages(conversationId: number) {
  return db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt)],
  });
}

async function getOrCreateConversation(clientId: number, psychologistId: number) {
  const existing = await getConversationBetween(clientId, psychologistId);
  if (existing) return existing;

  const [created] = await db
    .insert(conversations)
    .values({ clientId, psychologistId })
    .onConflictDoNothing()
    .returning();

  return created ?? (await getConversationBetween(clientId, psychologistId))!;
}

export async function sendMessage(input: {
  clientId: number;
  psychologistId: number;
  senderId: number;
  senderRole: UserRole;
  body: string;
}) {
  const conversation = await getOrCreateConversation(input.clientId, input.psychologistId);

  await db.transaction(async (tx) => {
    await tx.insert(messages).values({
      conversationId: conversation.id,
      senderId: input.senderId,
      body: input.body,
    });
    await tx
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversation.id));
  });

  const psychologistProfile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, input.psychologistId),
  });
  const recipientUserId =
    input.senderRole === "danisan" ? psychologistProfile?.userId : input.clientId;
  if (recipientUserId) {
    await createNotification({
      userId: recipientUserId,
      type: "yeni_mesaj",
      title: "Yeni mesajınız var",
      body: input.body.slice(0, 100),
      link:
        input.senderRole === "danisan"
          ? `/psikolog/mesajlar/${input.clientId}`
          : `/danisan/mesajlar/${input.psychologistId}`,
    });
  }

  return conversation;
}
