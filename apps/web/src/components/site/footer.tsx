import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { CrisisBanner } from "@/components/site/crisis-banner";
import { Logo } from "@/components/site/logo";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/psikologlar", label: "Psikolog Bul" },
      { href: "/eslesme", label: "Akıllı Eşleştirme" },
      { href: "/kayit/psikolog", label: "Psikolog Olarak Katıl" },
      { href: "/kurumsal", label: "Kurumsal" },
    ],
  },
  {
    title: "Kaynaklar",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/testler", label: "Öz-Değerlendirme Testleri" },
      { href: "/soru-sor", label: "Psikoloğa Soru Sor" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/gizlilik", label: "Gizlilik Politikası" },
      { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
      { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="/giris" className="font-medium text-primary hover:underline">
              Giriş Yap
            </Link>
            <Link href="/kayit/danisan" className="text-muted-foreground hover:text-foreground">
              Kayıt Ol
            </Link>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-medium text-foreground">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <CrisisBanner />

      <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
