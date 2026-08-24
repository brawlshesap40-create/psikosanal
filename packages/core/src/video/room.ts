import { randomUUID } from "crypto";

export function generateVideoRoomName() {
  return `psikosanal-${randomUUID()}`;
}

export function videoRoomUrl(roomName: string) {
  return `https://meet.jit.si/${roomName}`;
}
