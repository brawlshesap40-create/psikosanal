import { notFound } from "next/navigation";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getUserById } from "@/lib/users/queries";
import { getConversationBetween, getMessages } from "@/lib/conversations/queries";
import { MessageThread } from "@/components/messages/message-thread";

export default async function PsikologMesajThreadPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);
  if (!profile) return null;

  const { clientId } = await params;
  const client = await getUserById(Number(clientId));
  if (!client || client.role !== "danisan") notFound();

  const conversation = await getConversationBetween(client.id, profile.id);
  const initialMessages = conversation ? await getMessages(conversation.id) : [];

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-foreground">{client.fullName}</h1>
      <MessageThread
        clientId={client.id}
        psychologistId={profile.id}
        currentUserId={session.userId}
        counterpartName={client.fullName}
        initialMessages={initialMessages}
      />
    </div>
  );
}
