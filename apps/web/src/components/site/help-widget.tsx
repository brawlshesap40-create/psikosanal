"use client";

import Link from "next/link";
import { MessageCircleQuestion, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function HelpWidget() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            size="icon-lg"
            className="fixed right-4 bottom-4 z-40 rounded-full shadow-lg sm:right-6 sm:bottom-6"
          />
        }
      >
        <MessageCircleQuestion />
        <span className="sr-only">Yardım</span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Size nasıl yardımcı olabiliriz?</DialogTitle>
        <DialogDescription>
          Sorularınızı bize iletin, en kısa sürede dönüş yapalım.
        </DialogDescription>
        <div className="flex flex-col gap-2">
          <Button nativeButton={false} render={<Link href="/soru-sor" />}>
            Psikoloğa Soru Sor
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="mailto:destek@psikosanal.com" />}
          >
            <Mail />
            destek@psikosanal.com
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
