import { verifyDanisanSession } from "@/lib/auth/dal";
import { getUserById } from "@/lib/users/queries";
import { AccountForm } from "@/components/auth/account-form";

export default async function DanisanProfilPage() {
  const session = await verifyDanisanSession();
  const user = await getUserById(session.userId);
  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Profilim</h1>
      <div className="mt-6">
        <AccountForm fullName={user.fullName} phone={user.phone} email={user.email} />
      </div>
    </div>
  );
}
