import { getAllSpecialties } from "@/lib/specialties/queries";
import { getOptionalSession } from "@/lib/auth/dal";
import { AppMatchQuiz } from "@/components/app/app-match-quiz";

export default async function AppMatchPage() {
  const [specialties, session] = await Promise.all([
    getAllSpecialties(),
    getOptionalSession(),
  ]);

  return <AppMatchQuiz specialties={specialties} authed={Boolean(session)} />;
}
