import { getAllSpecialties } from "@/lib/specialties/queries";
import { MatchQuizForm } from "@/components/matching/match-quiz-form";

export default async function EslesmePage() {
  const specialties = await getAllSpecialties();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Akıllı Eşleştirme
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Birkaç soruyu yanıtlayın, kriterlerinize en uygun psikologları anında önerelim.
        </p>
      </div>

      <div className="mt-8">
        <MatchQuizForm specialties={specialties} />
      </div>
    </div>
  );
}
