import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterDanisanForm } from "@/components/auth/register-danisan-form";

export default function KayitDanisanPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Danışan Kaydı</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterDanisanForm />
        </CardContent>
      </Card>
    </div>
  );
}
