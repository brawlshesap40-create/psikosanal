import { notFound } from "next/navigation";
import { verifyDanisanSession } from "@/lib/auth/dal";
import { getPsychologistById } from "@/lib/psychologists/queries";
import { getConversationBetween, getMessages } from "@/lib/conversations/queries";
import { MessageThread } from "@/components/messages/message-thread";

export default async function DanisanMesajThreadPage({
  params,
}: {
  params: Promise<{ psychologistId: string }>;
}) {
  const session = await verifyDanisanSession();
  const { psychologistId } = await params;
  const psychologist = await getPsychologistById(Number(psychologistId));
  if (!psychologist) notFound();

  const conversation = await getConversationBetween(session.userId, psychologist.id);
  const initialMessages = conversation ? await getMessages(conversation.id) : [];

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-foreground">
        {psychologist.user.fullName}
      </h1>
      <MessageThread
        clientId={session.userId}
        psychologistId={psychologist.id}
        currentUserId={session.userId}
        counterpartName={psychologist.user.fullName}
        initialMessages={initialMessages}
      />
    </div>
  );
}
