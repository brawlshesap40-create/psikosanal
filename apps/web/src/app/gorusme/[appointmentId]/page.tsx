import { notFound, redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/dal";
import { getAppointmentById } from "@/lib/appointments/queries";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { signVideoToken } from "@/lib/video/room";
import { VideoCallRoom } from "@/components/video/video-call-room";

const JOIN_EARLY_MINUTES = 10;
const JOIN_GRACE_MINUTES = 15;

export default async function GorusmePage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const session = await getOptionalSession();
  if (!session) redirect("/giris");

  const { appointmentId } = await params;
  const appointment = await getAppointmentById(Number(appointmentId));
  if (!appointment) notFound();

  const isClient = session.role === "danisan" && session.userId === appointment.clientId;
  let isPsikolog = false;
  if (session.role === "psikolog") {
    const profile = await getPsychologistByUserId(session.userId);
    isPsikolog = Boolean(profile && profile.id === appointment.psychologistId);
  }
  if (!isClient && !isPsikolog) notFound();

  if (appointment.status !== "onaylandi") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Bu görüşme artık aktif değil.
        </p>
      </div>
    );
  }

  const startTime = appointment.slot.startTime;
  const endTime = new Date(startTime.getTime() + appointment.slot.durationMinutes * 60_000);
  const earliestJoin = new Date(startTime.getTime() - JOIN_EARLY_MINUTES * 60_000);
  const latestJoin = new Date(endTime.getTime() + JOIN_GRACE_MINUTES * 60_000);
  const now = new Date();

  if (now < earliestJoin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Görüşme henüz başlamadı. Görüşme odası, randevu saatinden{" "}
          {JOIN_EARLY_MINUTES} dakika önce açılır.
          <br />
          Randevu saati:{" "}
          {startTime.toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}
        </p>
      </div>
    );
  }

  if (now > latestJoin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Bu görüşmenin süresi doldu.
        </p>
      </div>
    );
  }

  const role = session.role as "danisan" | "psikolog";
  const token = await signVideoToken({
    appointmentId: appointment.id,
    userId: session.userId,
    role,
  });
  const wsBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
    /^http/,
    "ws"
  );
  const returnPath = role === "danisan" ? "/danisan/randevularim" : "/psikolog/randevularim";

  return (
    <VideoCallRoom
      roomName={appointment.videoRoomName}
      token={token}
      wsBaseUrl={wsBaseUrl}
      returnPath={returnPath}
    />
  );
}
