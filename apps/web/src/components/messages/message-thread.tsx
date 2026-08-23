"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { fetchMessagesAction, sendMessageAction } from "@/lib/conversations/actions";

type Message = {
  id: number;
  senderId: number;
  body: string;
  createdAt: Date;
};

export function MessageThread({
  clientId,
  psychologistId,
  currentUserId,
  counterpartName,
  initialMessages,
}: {
  clientId: number;
  psychologistId: number;
  currentUserId: number;
  counterpartName: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [state, action, pending] = useActionState(sendMessageAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const fresh = await fetchMessagesAction(clientId, psychologistId);
      setMessages(fresh);
    }, 6000);
    return () => clearInterval(interval);
  }, [clientId, psychologistId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (pending || state?.error) return;
    formRef.current?.reset();
    fetchMessagesAction(clientId, psychologistId).then(setMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return (
    <div className="flex h-[60vh] flex-col rounded-xl border border-border">
      <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">
        {counterpartName}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz mesaj yok.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[75%] rounded-lg px-3 py-2 text-sm",
              message.senderId === currentUserId
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {message.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={action}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="psychologistId" value={psychologistId} />
        <Textarea name="body" rows={1} placeholder="Mesajınızı yazın..." className="flex-1" />
        <Button type="submit" disabled={pending}>
          Gönder
        </Button>
      </form>
      {state?.error && <p className="px-3 pb-2 text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
