import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegisterPsikologForm } from "@/components/auth/register-psikolog-form";

export default function KayitPsikologPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Psikolog Başvurusu</CardTitle>
          <CardDescription>
            Başvurunuz admin ekibimiz tarafından incelendikten sonra profiliniz
            yayına alınır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterPsikologForm />
        </CardContent>
      </Card>
    </div>
  );
}
