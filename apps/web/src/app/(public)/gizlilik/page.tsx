import { LegalPage } from "@/components/site/legal-page";
import { siteConfig } from "@/lib/site-config";

export default function GizlilikPage() {
  return (
    <LegalPage title="Gizlilik Politikası">
      <p>
        Bu sayfa, {siteConfig.name} üzerinden paylaştığınız bilgilerin nasıl toplandığını,
        kullanıldığını ve korunduğunu genel hatlarıyla anlatır.
      </p>
      <h2>Hangi bilgileri topluyoruz</h2>
      <p>
        Hesap oluştururken verdiğiniz ad, e-posta ve telefon bilgileri; randevu ve ödeme
        geçmişiniz; psikologla yaptığınız yazışmalar ve görüşme kayıtları (görüşmelerin kendisi
        kaydedilmez, yalnızca randevu meta verileri tutulur).
      </p>
      <h2>Video görüşmeler</h2>
      <p>
        Her görüşme, yalnızca ilgili randevuya özel, tek kullanımlık bir odada gerçekleşir.
        Görüşme kaydı tutulmaz.
      </p>
      <h2>Ödemeler</h2>
      <p>
        Ödemeleriniz iyzico altyapısı üzerinden işlenir; kart bilgileriniz platformumuzda
        saklanmaz.
      </p>
      <h2>Bilgilerinizin paylaşımı</h2>
      <p>
        Bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. Psikoloğunuz,
        yalnızca sizinle olan randevu ve yazışma geçmişine erişebilir.
      </p>
    </LegalPage>
  );
}
