"use server";

import { revalidatePath } from "next/cache";
import { favoritesService } from "@psikosanal/core";
import { verifyDanisanSession } from "@/lib/auth/dal";

export async function toggleFavoriteAction(psychologistId: number) {
  const session = await verifyDanisanSession();

  const result = await favoritesService.toggleFavorite(session.userId, psychologistId);

  revalidatePath("/psikologlar");
  revalidatePath("/danisan/favorilerim");
  return result;
}
