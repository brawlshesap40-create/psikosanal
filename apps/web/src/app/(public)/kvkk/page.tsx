import { LegalPage } from "@/components/site/legal-page";
import { siteConfig } from "@/lib/site-config";

export default function KvkkPage() {
  return (
    <LegalPage title="KVKK Aydınlatma Metni">
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, {siteConfig.name}{" "}
        olarak kişisel verilerinizi hangi amaçlarla işlediğimizi bu metinle aydınlatıyoruz.
      </p>
      <h2>İşlenen veriler</h2>
      <p>
        Kimlik ve iletişim bilgileriniz, randevu ve ödeme geçmişiniz, psikologla yaptığınız
        yazışmalar ve (varsa) sağlık geçmişinize dair paylaştığınız notlar.
      </p>
      <h2>İşleme amaçları</h2>
      <p>
        Randevu ve ödeme süreçlerinin yürütülmesi, hesabınızın güvenliğinin sağlanması,
        yasal yükümlülüklerin yerine getirilmesi ve hizmet kalitesinin iyileştirilmesi.
      </p>
      <h2>Haklarınız</h2>
      <p>
        KVKK&apos;nın 11. maddesi kapsamında verilerinizin işlenip işlenmediğini öğrenme, düzeltme,
        silinmesini talep etme ve işlemeye itiraz etme haklarına sahipsiniz.
      </p>
    </LegalPage>
  );
}
