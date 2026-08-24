"use server";

import { revalidatePath } from "next/cache";
import { conversationsService, DomainError } from "@psikosanal/core";
import { getOptionalSession } from "@/lib/auth/dal";
import { sendMessageSchema } from "@/lib/validation/message";
import { getConversationBetween, getMessages } from "./queries";

export type MessageFormState = { error?: string } | undefined;

export async function sendMessageAction(
  _prevState: MessageFormState,
  formData: FormData
): Promise<MessageFormState> {
  const clientId = Number(formData.get("clientId"));
  const psychologistId = Number(formData.get("psychologistId"));

  const session = await getOptionalSession();
  if (!session) return { error: "Oturum bulunamadı" };

  const parsed = sendMessageSchema.safeParse({
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Mesaj gönderilemedi." };
  }

  try {
    await conversationsService.requireParticipant(session, clientId, psychologistId);
    await conversationsService.sendMessage({
      clientId,
      psychologistId,
      senderId: session.userId,
      senderRole: session.role,
      body: parsed.data.body,
    });
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath(`/danisan/mesajlar/${psychologistId}`);
  revalidatePath(`/psikolog/mesajlar/${clientId}`);
}

export async function fetchMessagesAction(clientId: number, psychologistId: number) {
  const session = await getOptionalSession();
  if (!session) throw new Error("Oturum bulunamadı");

  await conversationsService.requireParticipant(session, clientId, psychologistId);
  const conversation = await getConversationBetween(clientId, psychologistId);
  if (!conversation) return [];
  return getMessages(conversation.id);
}
