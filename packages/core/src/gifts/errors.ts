import { DomainError } from "../auth/errors";

export function voucherNotFound() {
  return new DomainError("voucher_not_found", "Bu hediye kodu geçerli değil.", 404);
}

export function voucherAlreadyRedeemed() {
  return new DomainError("voucher_already_redeemed", "Bu hediye kodu daha önce kullanılmış.", 409);
}
