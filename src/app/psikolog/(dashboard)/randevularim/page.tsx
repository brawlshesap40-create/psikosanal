import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getAppointmentsForPsychologist } from "@/lib/appointments/queries";
import { AppointmentRow } from "@/components/appointments/appointment-row";

export default async function PsikologRandevularimPage() {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);
  if (!profile) return null;

  const appointments = await getAppointmentsForPsychologist(profile.id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Randevularım</h1>

      <div className="mt-6 flex flex-col gap-3">
        {appointments.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz bir randevunuz yok.</p>
        )}
        {appointments.map((appointment) => (
          <AppointmentRow key={appointment.id} appointment={appointment} viewer="psikolog" />
        ))}
      </div>
    </div>
  );
}
