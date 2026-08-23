import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getSlotsForPsychologist } from "@/lib/availability/queries";
import { getAppointmentsForPsychologist } from "@/lib/appointments/queries";
import { Card, CardContent } from "@/components/ui/card";

export default async function PsikologPanelPage() {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);
  if (!profile) return null;

  const [slots, appointments] = await Promise.all([
    getSlotsForPsychologist(profile.id),
    getAppointmentsForPsychologist(profile.id),
  ]);

  const upcoming = appointments.filter((a) => a.status === "onaylandi").length;
  const completed = appointments.filter((a) => a.status === "tamamlandi").length;
  const openSlots = slots.filter((s) => s.status === "musait").length;

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">
        Hoş geldiniz, {profile.title}
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Yaklaşan Randevu</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tamamlanan Seans</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Açık Müsaitlik</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{openSlots}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
