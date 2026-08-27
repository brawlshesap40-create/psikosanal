import { notFound, redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/dal";
import { getPsychologistById } from "@/lib/psychologists/queries";
import { getConversationBetween, getMessages } from "@/lib/conversations/queries";
import { MessageThread } from "@/components/messages/message-thread";
import { AppScreen } from "@/components/app/app-screen";

export default async function AppMessageThreadPage({
  params,
}: {
  params: Promise<{ psychologistId: string }>;
}) {
  const session = await getOptionalSession();
  if (!session) redirect("/giris?next=/uygulama/mesajlar");
  if (session.role !== "danisan") redirect("/uygulama/mesajlar");

  const { psychologistId } = await params;
  const psychologist = await getPsychologistById(Number(psychologistId));
  if (!psychologist) notFound();

  const conversation = await getConversationBetween(session.userId, psychologist.id);
  const initialMessages = conversation ? await getMessages(conversation.id) : [];

  return (
    <AppScreen title={psychologist.user.fullName} back="/uygulama/mesajlar">
      <MessageThread
        clientId={session.userId}
        psychologistId={psychologist.id}
        currentUserId={session.userId}
        counterpartName={psychologist.user.fullName}
        initialMessages={initialMessages}
      />
    </AppScreen>
  );
}
