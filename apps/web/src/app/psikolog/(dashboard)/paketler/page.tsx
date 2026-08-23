import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getPackagesForPsychologist } from "@/lib/packages/queries";
import { PackageForm } from "@/components/packages/package-form";
import { PackageList } from "@/components/packages/package-list";

export default async function PsikologPaketlerPage() {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);
  if (!profile) return null;

  const packages = await getPackagesForPsychologist(profile.id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Paketler</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Danışanlarınızın toplu seans satın alabileceği paketler tanımlayın.
      </p>

      <div className="mt-6">
        <PackageForm />
      </div>

      <div className="mt-6">
        <PackageList packages={packages} />
      </div>
    </div>
  );
}
