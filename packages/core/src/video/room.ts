import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { getApiJwtSecret } from "../auth/config";

export function generateVideoRoomName() {
  return `psikosanal-${randomUUID()}`;
}

export function videoRoomUrl(roomName: string) {
  return `https://meet.jit.si/${roomName}`;
}

export type VideoTokenPayload = {
  appointmentId: number;
  userId: number;
  role: "danisan" | "psikolog";
};

/**
 * Short-lived token proving a signed-in user was authorized (by apps/web's
 * cookie session, checked before calling this) to join a specific
 * appointment's video room. apps/api's WebSocket signaling server verifies
 * this instead of trusting apps/web's cookie session directly — the two
 * apps have independent auth transports.
 */
export async function signVideoToken(payload: VideoTokenPayload) {
  return new SignJWT({ appointmentId: payload.appointmentId, role: payload.role, typ: "video" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime("4h")
    .sign(getApiJwtSecret());
}

export async function verifyVideoToken(token: string): Promise<VideoTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getApiJwtSecret(), { algorithms: ["HS256"] });
    if (payload.typ !== "video" || !payload.sub) return null;
    return {
      appointmentId: Number(payload.appointmentId),
      userId: Number(payload.sub),
      role: payload.role as "danisan" | "psikolog",
    };
  } catch {
    return null;
  }
}
