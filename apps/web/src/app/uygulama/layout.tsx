import type { Metadata, Viewport } from "next";
import { AppTabBar } from "@/components/app/app-tab-bar";
import "./app.css";

export const metadata: Metadata = {
  title: "Psikosanal Uygulaması",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b7c86",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      {children}
      <AppTabBar />
    </div>
  );
}
