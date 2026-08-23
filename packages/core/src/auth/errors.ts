export class DomainError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
  }
}

export function invalidCredentials() {
  return new DomainError(
    "invalid_credentials",
    "E-posta veya şifre hatalı.",
    401
  );
}

export function emailTaken() {
  return new DomainError(
    "email_taken",
    "Bu e-posta adresi zaten kayıtlı.",
    409
  );
}

export function accountDisabled() {
  return new DomainError(
    "account_disabled",
    "Hesabınız devre dışı bırakılmış. Lütfen bizimle iletişime geçin.",
    403
  );
}

export function unauthorized() {
  return new DomainError("unauthorized", "Yetkisiz işlem.", 401);
}

export function forbidden() {
  return new DomainError("forbidden", "Bu işlem için yetkiniz yok.", 403);
}

export function validationError(message: string) {
  return new DomainError("validation_error", message, 422);
}

export function invalidRefreshToken() {
  return new DomainError(
    "invalid_refresh_token",
    "Geçersiz veya süresi dolmuş oturum.",
    401
  );
}
