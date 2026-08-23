import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/dal";
import { getAppointmentById } from "@/lib/appointments/queries";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { siteConfig } from "@/lib/site-config";

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(value: string) {
  return value.replace(/[,;]/g, (match) => `\\${match}`).replace(/\n/g, "\\n");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  const session = await getOptionalSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { appointmentId } = await params;
  const appointment = await getAppointmentById(Number(appointmentId));
  if (!appointment) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const isClient = session.role === "danisan" && session.userId === appointment.clientId;
  let isPsikolog = false;
  if (session.role === "psikolog") {
    const profile = await getPsychologistByUserId(session.userId);
    isPsikolog = Boolean(profile && profile.id === appointment.psychologistId);
  }
  if (!isClient && !isPsikolog) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const start = appointment.slot.startTime;
  const end = new Date(start.getTime() + appointment.slot.durationMinutes * 60_000);
  const summary = escapeIcsText(
    isClient
      ? `${appointment.psychologist.user.fullName} ile Seans`
      : `${appointment.client.fullName} ile Seans`
  );
  const url = `${siteConfig.siteUrl}/gorusme/${appointment.id}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteConfig.name}//TR`,
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:appointment-${appointment.id}@${new URL(siteConfig.siteUrl).host}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${escapeIcsText(`Görüşme linki: ${url}`)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="randevu-${appointment.id}.ics"`,
    },
  });
}
