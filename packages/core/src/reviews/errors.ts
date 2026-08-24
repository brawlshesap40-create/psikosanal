import { DomainError } from "../auth/errors";

export function appointmentNotCompleted() {
  return new DomainError(
    "appointment_not_completed",
    "Sadece tamamlanan randevular değerlendirilebilir.",
    409
  );
}

export function reviewAlreadyExists() {
  return new DomainError(
    "review_already_exists",
    "Bu randevu için zaten bir değerlendirme yapılmış.",
    409
  );
}
