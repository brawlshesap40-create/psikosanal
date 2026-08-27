import { DomainError } from "../auth/errors";

export function discountCodeNotFound() {
  return new DomainError("discount_code_not_found", "Bu indirim kodu geçerli değil.", 404);
}

export function discountCodeExpired() {
  return new DomainError("discount_code_expired", "Bu indirim kodunun süresi dolmuş.", 409);
}

export function discountCodeLimitReached() {
  return new DomainError(
    "discount_code_limit_reached",
    "Bu indirim kodu kullanım limitine ulaştı.",
    409
  );
}

export function discountCodeNotApplicable() {
  return new DomainError(
    "discount_code_not_applicable",
    "Bu indirim kodu bu işlem için geçerli değil.",
    409
  );
}

export function discountCodeTaken() {
  return new DomainError("discount_code_taken", "Bu kod zaten kullanılıyor.", 409);
}
