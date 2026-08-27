import Link from "next/link";
import { verifyDanisanSession } from "@/lib/auth/dal";
import { getConversationsForClient } from "@/lib/conversations/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function DanisanMesajlarPage() {
  const session = await verifyDanisanSession();
  const conversations = await getConversationsForClient(session.userId);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Mesajlarım</h1>

      <div className="mt-6 flex flex-col gap-3">
        {conversations.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Henüz bir mesajlaşmanız yok. Bir randevu sayfasından &ldquo;Mesaj&rdquo;a tıklayarak başlayabilirsiniz.
          </p>
        )}
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/danisan/mesajlar/${conversation.psychologistId}`}
          >
            <Card className="card-interactive">
              <CardContent>
                <p className="font-medium text-foreground">
                  {conversation.psychologist.user.fullName}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
