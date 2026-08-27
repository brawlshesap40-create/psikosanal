import { DomainError } from "../auth/errors";

export function blogPostNotFound() {
  return new DomainError("blog_post_not_found", "Yazı bulunamadı.", 404);
}

export function blogSlugTaken() {
  return new DomainError("blog_slug_taken", "Bu URL (slug) zaten kullanılıyor.", 409);
}
