import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";

export async function getAppointmentsForClient(clientId: number) {
  return db.query.appointments.findMany({
    where: eq(appointments.clientId, clientId),
    orderBy: [desc(appointments.createdAt)],
    with: {
      slot: true,
      psychologist: { with: { user: true } },
      review: true,
    },
  });
}

export async function getAppointmentsForPsychologist(psychologistId: number) {
  return db.query.appointments.findMany({
    where: eq(appointments.psychologistId, psychologistId),
    orderBy: [desc(appointments.createdAt)],
    with: {
      slot: true,
      client: true,
    },
  });
}

export async function getAppointmentById(id: number) {
  return db.query.appointments.findFirst({
    where: eq(appointments.id, id),
    with: {
      slot: true,
      client: true,
      psychologist: { with: { user: true } },
    },
  });
}

export async function getAllAppointments() {
  return db.query.appointments.findMany({
    orderBy: [desc(appointments.createdAt)],
    with: {
      slot: true,
      client: true,
      psychologist: { with: { user: true } },
    },
  });
}
