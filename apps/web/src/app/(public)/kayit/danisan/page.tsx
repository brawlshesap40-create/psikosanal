import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterDanisanForm } from "@/components/auth/register-danisan-form";

export default function KayitDanisanPage() {
  return (
    <AuthPageShell>
      <Card className="shadow-xl shadow-black/[0.04]">
        <CardHeader>
          <CardTitle className="text-xl">
            <span className="text-gradient-brand">Danışan</span> Kaydı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterDanisanForm />
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}
