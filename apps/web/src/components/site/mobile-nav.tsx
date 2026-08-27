"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LINKS = [
  { href: "/psikologlar", label: "Psikolog Bul" },
  { href: "/eslesme", label: "Akıllı Eşleştirme" },
  { href: "/testler", label: "Testler" },
  { href: "/blog", label: "Blog" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/soru-sor", label: "Soru Sor" },
  { href: "/kayit/psikolog", label: "Psikolog Misiniz?" },
];

export function MobileNav({ authed = false }: { authed?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
        <Menu />
        <span className="sr-only">Menü</span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Menü</DialogTitle>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}

          {!authed && (
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                nativeButton={false}
                onClick={() => setOpen(false)}
                render={<Link href="/giris" />}
              >
                Giriş Yap
              </Button>
              <Button
                nativeButton={false}
                onClick={() => setOpen(false)}
                render={<Link href="/kayit/danisan" />}
              >
                Kayıt Ol
              </Button>
            </div>
          )}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
