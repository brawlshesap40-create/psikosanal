"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { conversations, messages, psychologistProfiles } from "@/lib/db/schema";
import { getOptionalSession } from "@/lib/auth/dal";
import { sendMessageSchema } from "@/lib/validation/message";
import { createNotification } from "@/lib/notifications/actions";
import { getConversationBetween, getMessages } from "./queries";

export type MessageFormState = { error?: string } | undefined;

async function requireParticipant(clientId: number, psychologistId: number) {
  const session = await getOptionalSession();
  if (!session) throw new Error("Oturum bulunamadı");

  if (session.role === "danisan" && session.userId === clientId) return session;

  if (session.role === "psikolog") {
    const profile = await db.query.psychologistProfiles.findFirst({
      where: eq(psychologistProfiles.userId, session.userId),
    });
    if (profile && profile.id === psychologistId) return session;
  }

  throw new Error("Yetkisiz işlem");
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

export async function sendMessageAction(
  _prevState: MessageFormState,
  formData: FormData
): Promise<MessageFormState> {
  const clientId = Number(formData.get("clientId"));
  const psychologistId = Number(formData.get("psychologistId"));
  const session = await requireParticipant(clientId, psychologistId);

  const parsed = sendMessageSchema.safeParse({
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Mesaj gönderilemedi." };
  }

  const conversation = await getOrCreateConversation(clientId, psychologistId);

  await db.transaction(async (tx) => {
    await tx.insert(messages).values({
      conversationId: conversation.id,
      senderId: session.userId,
      body: parsed.data.body,
    });
    await tx
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversation.id));
  });

  const psychologistProfile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, psychologistId),
  });
  const recipientUserId =
    session.role === "danisan" ? psychologistProfile?.userId : clientId;
  if (recipientUserId) {
    await createNotification({
      userId: recipientUserId,
      type: "yeni_mesaj",
      title: "Yeni mesajınız var",
      body: parsed.data.body.slice(0, 100),
      link:
        session.role === "danisan"
          ? `/psikolog/mesajlar/${clientId}`
          : `/danisan/mesajlar/${psychologistId}`,
    });
  }

  revalidatePath(`/danisan/mesajlar/${psychologistId}`);
  revalidatePath(`/psikolog/mesajlar/${clientId}`);
}

export async function fetchMessagesAction(clientId: number, psychologistId: number) {
  await requireParticipant(clientId, psychologistId);
  const conversation = await getConversationBetween(clientId, psychologistId);
  if (!conversation) return [];
  return getMessages(conversation.id);
}
