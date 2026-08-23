import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPsychologistApplicationById } from "@/lib/psychologists/queries";
import { getDocumentViewUrl } from "@/lib/storage/upload";
import { ApplicationReviewActions } from "@/components/admin/application-review-actions";

export default async function PsikologBasvuruDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getPsychologistApplicationById(Number(id));
  if (!application) notFound();

  const diplomaUrl = application.licenseDocumentKey
    ? await getDocumentViewUrl(application.licenseDocumentKey)
    : null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-foreground">{application.user.fullName}</h1>
      <p className="text-sm text-muted-foreground">{application.user.email}</p>

      <Card className="mt-6">
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Unvan</p>
              <p className="text-foreground">{application.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Şehir</p>
              <p className="text-foreground">{application.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deneyim</p>
              <p className="text-foreground">{application.experienceYears} yıl</p>
            </div>
            <div>
              <p className="text-muted-foreground">Telefon</p>
              <p className="text-foreground">{application.user.phone}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Hakkında</p>
            <p className="mt-1 text-sm text-foreground">{application.bio}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {application.specialties.map((entry) => (
              <Badge key={entry.specialty.id} variant="secondary">
                {entry.specialty.name}
              </Badge>
            ))}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Psikoloji Lisans Diploması</p>
            {diplomaUrl ? (
              <Button
                size="sm"
                variant="outline"
                className="mt-1"
                nativeButton={false}
                render={<a href={diplomaUrl} target="_blank" rel="noreferrer" />}
              >
                <FileText className="size-4" />
                Belgeyi Görüntüle
              </Button>
            ) : (
              <p className="mt-1 text-sm text-destructive">
                Belge yüklenmemiş — onaylamadan önce başvuru sahibiyle iletişime geçin.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <ApplicationReviewActions psychologistId={application.id} />
      </div>
    </div>
  );
}
