import { DomainError } from "../auth/errors";

export function appointmentNotFound() {
  return new DomainError("appointment_not_found", "Randevu bulunamadı", 404);
}

export function cancellationWindowPassed(hours: number) {
  return new DomainError(
    "cancellation_window_passed",
    `Randevuyu başlamasına ${hours} saatten az kala iptal edemezsiniz. Lütfen psikoloğunuzla iletişime geçin.`,
    409
  );
}

export function appointmentNotConfirmed() {
  return new DomainError(
    "appointment_not_confirmed",
    "Sadece onaylanmış randevular için işaretlenebilir.",
    409
  );
}
