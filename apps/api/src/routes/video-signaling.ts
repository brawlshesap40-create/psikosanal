import type { FastifyInstance } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import { appointmentsService, verifyVideoToken } from "@psikosanal/core";

type Peer = { userId: number; socket: WebSocket };
const rooms = new Map<string, Peer[]>();

function send(socket: WebSocket, message: unknown) {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
}

function removePeer(roomName: string, socket: WebSocket) {
  const peers = rooms.get(roomName);
  if (!peers) return;
  const index = peers.findIndex((peer) => peer.socket === socket);
  if (index === -1) return;
  peers.splice(index, 1);
  if (peers.length === 0) {
    rooms.delete(roomName);
  } else {
    send(peers[0].socket, { type: "peer-left" });
  }
}

export default async function videoSignalingRoutes(app: FastifyInstance) {
  app.get("/ws/gorusme/:roomName", { websocket: true }, async (socket, request) => {
    const { roomName } = request.params as { roomName: string };
    const { token } = request.query as { token?: string };

    const claim = token ? await verifyVideoToken(token) : null;
    if (!claim) {
      socket.close(4401, "invalid_token");
      return;
    }

    const appointment = await appointmentsService.getAppointmentById(claim.appointmentId);
    if (!appointment || appointment.videoRoomName !== roomName) {
      socket.close(4404, "room_not_found");
      return;
    }
    if (appointment.status !== "onaylandi") {
      socket.close(4403, "appointment_not_active");
      return;
    }
    const authorized =
      (claim.role === "danisan" && claim.userId === appointment.clientId) ||
      (claim.role === "psikolog" && claim.userId === appointment.psychologist.user.id);
    if (!authorized) {
      socket.close(4403, "forbidden");
      return;
    }

    const peers = rooms.get(roomName) ?? [];
    const existing = peers.find((peer) => peer.userId === claim.userId);
    if (existing) {
      existing.socket.close(4409, "replaced_by_new_connection");
      const index = peers.indexOf(existing);
      peers.splice(index, 1);
    } else if (peers.length >= 2) {
      socket.close(4408, "room_full");
      return;
    }

    peers.push({ userId: claim.userId, socket });
    rooms.set(roomName, peers);

    if (peers.length === 1) {
      send(socket, { type: "waiting" });
    } else {
      send(peers[0].socket, { type: "ready", initiator: false });
      send(peers[1].socket, { type: "ready", initiator: true });
    }

    socket.on("message", (raw: Buffer) => {
      const current = rooms.get(roomName);
      if (!current) return;
      const other = current.find((peer) => peer.socket !== socket);
      if (other) other.socket.send(raw.toString());
    });

    socket.on("close", () => removePeer(roomName, socket));
  });
}
