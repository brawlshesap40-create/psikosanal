import { DomainError } from "../auth/errors";

export function slotConflict() {
  return new DomainError(
    "slot_conflict",
    "Seçilen saatlerden biri için zaten bir müsaitlik kaydı var.",
    409
  );
}
