import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RegisterPsikologForm } from "@/components/auth/register-psikolog-form";

export default function KayitPsikologPage() {
  return (
    <AuthPageShell maxWidth="max-w-xl">
      <Card className="shadow-xl shadow-black/[0.04]">
        <CardHeader>
          <CardTitle className="text-xl">
            <span className="text-gradient-brand">Psikolog</span> Başvurusu
          </CardTitle>
          <CardDescription>
            Başvurunuz admin ekibimiz tarafından incelendikten sonra profiliniz
            yayına alınır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterPsikologForm />
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}
