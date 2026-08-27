import Link from "next/link";
import { MessageSquareDashed } from "lucide-react";
import { getOptionalSession } from "@/lib/auth/dal";
import { getConversationsForClient } from "@/lib/conversations/queries";
import { AppScreen } from "@/components/app/app-screen";
import { AppGuest } from "@/components/app/app-guest";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "şimdi";
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} sa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} g`;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default async function AppMessagesPage() {
  const session = await getOptionalSession();

  if (!session) {
    return (
      <AppScreen title="Mesajlar">
        <AppGuest next="/uygulama/mesajlar" />
      </AppScreen>
    );
  }

  if (session.role !== "danisan") {
    return (
      <AppScreen title="Mesajlar">
        <div className="app-card p-5 text-sm text-muted-foreground">
          Mesajlaşma web panelinde.
        </div>
      </AppScreen>
    );
  }

  const conversations = await getConversationsForClient(session.userId);

  return (
    <AppScreen title="Mesajlar" subtitle={`${conversations.length} sohbet`}>
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="app-icon-tile size-12">
            <MessageSquareDashed className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            Henüz mesajın yok. Bir psikologla iletişime geç.
          </p>
          <Link
            href="/uygulama/psikologlar"
            className="press rounded-full bg-brand px-4 py-2.5 text-[13px] font-semibold text-brand-foreground"
          >
            Psikolog Bul
          </Link>
        </div>
      ) : (
        <div className="app-list">
          {conversations.map((c) => {
            const name = c.psychologist.user?.fullName ?? c.psychologist.title;
            return (
              <Link
                key={c.id}
                href={`/uygulama/mesajlar/${c.psychologistId}`}
                className="press flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--app-bg)]"
              >
                <Avatar size="lg" className="size-12 shrink-0">
                  <AvatarImage src={c.psychologist.photoUrl ?? undefined} alt={name} />
                  <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-foreground">{name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {c.psychologist.title}
                  </p>
                </div>
                {c.lastMessageAt && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(new Date(c.lastMessageAt))}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </AppScreen>
  );
}
