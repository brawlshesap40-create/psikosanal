"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "psikosanal_cerez_onayi";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === null;
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return false;
}

function accept() {
  try {
    localStorage.setItem(STORAGE_KEY, "kabul-edildi");
  } catch {
    // localStorage erişilemez olabilir, banner yine de kapatılır
  }
  listeners.forEach((listener) => listener());
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card px-4 py-4 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Siteyi kullanmaya devam
          ederek çerez kullanımını kabul etmiş olursunuz.
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Anladım
        </Button>
      </div>
    </div>
  );
}
