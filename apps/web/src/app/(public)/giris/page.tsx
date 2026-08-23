import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
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
    </div>
  );
}
