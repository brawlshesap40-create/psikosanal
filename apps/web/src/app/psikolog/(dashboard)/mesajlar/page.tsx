import Link from "next/link";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getConversationsForPsychologist } from "@/lib/conversations/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function PsikologMesajlarPage() {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);
  if (!profile) return null;

  const conversations = await getConversationsForPsychologist(profile.id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Mesajlarım</h1>

      <div className="mt-6 flex flex-col gap-3">
        {conversations.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz bir mesajlaşmanız yok.</p>
        )}
        {conversations.map((conversation) => (
          <Link key={conversation.id} href={`/psikolog/mesajlar/${conversation.clientId}`}>
            <Card className="card-interactive">
              <CardContent>
                <p className="font-medium text-foreground">{conversation.client.fullName}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
