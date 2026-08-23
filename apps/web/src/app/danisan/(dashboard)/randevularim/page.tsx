import { verifyDanisanSession } from "@/lib/auth/dal";
import { getAppointmentsForClient } from "@/lib/appointments/queries";
import { AppointmentRow } from "@/components/appointments/appointment-row";

export default async function DanisanRandevularimPage() {
  const session = await verifyDanisanSession();
  const appointments = await getAppointmentsForClient(session.userId);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Randevularım</h1>

      <div className="mt-6 flex flex-col gap-3">
        {appointments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Henüz bir randevunuz yok.
          </p>
        )}
        {appointments.map((appointment) => (
          <AppointmentRow key={appointment.id} appointment={appointment} viewer="danisan" />
        ))}
      </div>
    </div>
  );
}
