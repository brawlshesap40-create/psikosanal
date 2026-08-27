import Link from "next/link";
import { getPendingApplications } from "@/lib/psychologists/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function PsikologBasvurulariPage() {
  const applications = await getPendingApplications();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Psikolog Başvuruları</h1>

      <div className="mt-6 flex flex-col gap-3">
        {applications.length === 0 && (
          <p className="text-sm text-muted-foreground">Bekleyen başvuru yok.</p>
        )}
        {applications.map((application) => (
          <Link key={application.id} href={`/admin/psikolog-basvurulari/${application.id}`}>
            <Card className="card-interactive">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{application.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {application.title} · {application.city}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{application.user.email}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
