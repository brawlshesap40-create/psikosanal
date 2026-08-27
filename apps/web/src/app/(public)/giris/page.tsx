import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthPageShell>
      <Card className="shadow-xl shadow-black/[0.04]">
        <CardHeader>
          <CardTitle className="text-xl">
            Tekrar <span className="text-gradient-brand">hoş geldiniz</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link href="/kayit/danisan" className="text-primary hover:underline">
              Danışan olarak kayıt olun
            </Link>{" "}
            veya{" "}
            <Link href="/kayit/psikolog" className="text-primary hover:underline">
              psikolog olarak başvurun
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </AuthPageShell>
  );
}
