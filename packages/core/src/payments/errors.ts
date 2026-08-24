import { DomainError } from "../auth/errors";

export function slotNotFound() {
  return new DomainError("slot_not_found", "Bu randevu saati bulunamadı.", 404);
}

export function slotUnavailable() {
  return new DomainError(
    "slot_unavailable",
    "Bu saat artık müsait değil. Lütfen başka bir saat seçin.",
    409
  );
}

export function priceNotSet() {
  return new DomainError(
    "price_not_set",
    "Bu psikolog için seans ücreti tanımlanmamış.",
    409
  );
}

export function iyzicoNotConfigured() {
  return new DomainError(
    "iyzico_not_configured",
    "Ödeme sistemi şu anda yapılandırılmamış (IYZICO_API_KEY / IYZICO_SECRET_KEY eksik).",
    503
  );
}

export function paymentInitFailed() {
  return new DomainError("payment_init_failed", "Ödeme başlatılamadı. Lütfen tekrar deneyin.", 502);
}

export function iyzicoUnreachable() {
  return new DomainError(
    "iyzico_unreachable",
    "Ödeme sistemine ulaşılamadı. Lütfen tekrar deneyin.",
    502
  );
}

export function packageNotFound() {
  return new DomainError("package_not_found", "Paket bulunamadı.", 404);
}

export function paymentNotFound() {
  return new DomainError("payment_not_found", "Ödeme bulunamadı.", 404);
}

export function onlySuccessfulRefundable() {
  return new DomainError(
    "only_successful_refundable",
    "Sadece başarılı ödemeler iade edilebilir.",
    409
  );
}

export function noIyzicoRecord() {
  return new DomainError(
    "no_iyzico_record",
    "Bu ödeme için iyzico işlem kaydı bulunamadı.",
    409
  );
}

export function refundFailed() {
  return new DomainError("refund_failed", "İade işlemi başarısız oldu.", 502);
}
