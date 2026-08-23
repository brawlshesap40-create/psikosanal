import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getAllSpecialties } from "@/lib/specialties/queries";
import { PhotoUploader } from "@/components/psychologists/photo-uploader";
import { ProfileForm } from "@/components/psychologists/profile-form";

export default async function PsikologProfilPage() {
  const session = await verifyPsikologSession();
  const [profile, allSpecialties] = await Promise.all([
    getPsychologistByUserId(session.userId),
    getAllSpecialties(),
  ]);
  if (!profile) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Profilim</h1>

      <div className="mt-6">
        <PhotoUploader currentUrl={profile.photoUrl} fallback={profile.title} />
      </div>

      <div className="mt-6">
        <ProfileForm profile={profile} allSpecialties={allSpecialties} />
      </div>
    </div>
  );
}
