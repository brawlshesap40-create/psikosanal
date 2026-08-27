import { DomainError } from "../auth/errors";

export function testNotFound() {
  return new DomainError("test_not_found", "Test bulunamadı.", 404);
}
