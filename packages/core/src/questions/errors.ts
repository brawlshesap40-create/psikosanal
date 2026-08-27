import { DomainError } from "../auth/errors";

export function questionNotFound() {
  return new DomainError("question_not_found", "Soru bulunamadı.", 404);
}

export function questionAlreadyAnswered() {
  return new DomainError("question_already_answered", "Bu soru zaten cevaplanmış.", 409);
}
