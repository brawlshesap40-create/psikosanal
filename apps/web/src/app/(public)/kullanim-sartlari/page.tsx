import { LegalPage } from "@/components/site/legal-page";
import { siteConfig } from "@/lib/site-config";

export default function KullanimSartlariPage() {
  return (
    <LegalPage title="Kullanım Şartları">
      <p>
        {siteConfig.name} platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
      </p>
      <h2>Hizmetin niteliği</h2>
      <p>
        {siteConfig.name}, danışanları bağımsız çalışan lisanslı psikologlarla buluşturan bir
        randevu platformudur; platformun kendisi psikolojik danışmanlık hizmeti vermez ve acil
        durum hizmeti değildir.
      </p>
      <h2>Hesap sorumluluğu</h2>
      <p>
        Hesabınıza ait giriş bilgilerinin güvenliğinden siz sorumlusunuz. Yanlış veya yanıltıcı
        bilgi paylaşımı hesabınızın askıya alınmasına neden olabilir.
      </p>
      <h2>Ödeme ve iptal</h2>
      <p>
        Randevu ve paket ödemeleri iyzico altyapısı üzerinden alınır. İptal ve iade koşulları
        randevu detay sayfasında ayrıca belirtilir.
      </p>
    </LegalPage>
  );
}
