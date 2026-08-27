import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { HelpWidget } from "@/components/site/help-widget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <HelpWidget />
    </>
  );
}
