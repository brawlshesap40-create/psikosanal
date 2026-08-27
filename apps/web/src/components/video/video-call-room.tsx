"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

type Status = "connecting" | "waiting" | "negotiating" | "connected" | "ended" | "error";

const STATUS_LABEL: Record<Status, string> = {
  connecting: "Bağlanılıyor...",
  waiting: "Diğer katılımcı bekleniyor...",
  negotiating: "Görüşme kuruluyor...",
  connected: "",
  ended: "Görüşme sona erdi.",
  error: "Bağlantı kurulamadı. Kamera/mikrofon izinlerinizi kontrol edip tekrar deneyin.",
};

export function VideoCallRoom({
  roomName,
  token,
  wsBaseUrl,
  returnPath,
}: {
  roomName: string;
  token: string;
  wsBaseUrl: string;
  returnPath: string;
}) {
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatusState] = useState<Status>("connecting");
  const statusRef = useRef<Status>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  function setStatus(next: Status) {
    statusRef.current = next;
    setStatusState(next);
  }

  useEffect(() => {
    let cancelled = false;

    function createPeerConnection(stream: MediaStream, ws: WebSocket) {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          ws.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setStatus("connected");
        else if (pc.connectionState === "failed") setStatus("error");
      };
      return pc;
    }

    async function start() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const ws = new WebSocket(`${wsBaseUrl}/ws/gorusme/${roomName}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onclose = (event) => {
        if (cancelled) return;
        if (event.code === 1000) setStatus("ended");
        else if (statusRef.current !== "connected") setStatus("error");
      };
      ws.onerror = () => {
        if (!cancelled) setStatus("error");
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "waiting") {
          setStatus("waiting");
        } else if (message.type === "ready") {
          setStatus("negotiating");
          const pc = createPeerConnection(stream, ws);
          if (message.initiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: "offer", sdp: offer }));
          }
        } else if (message.type === "offer") {
          const pc = pcRef.current ?? createPeerConnection(stream, ws);
          await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", sdp: answer }));
        } else if (message.type === "answer") {
          await pcRef.current?.setRemoteDescription(new RTCSessionDescription(message.sdp));
        } else if (message.type === "ice-candidate") {
          try {
            await pcRef.current?.addIceCandidate(message.candidate);
          } catch {
            // ICE candidates that arrive after the connection settles can safely be ignored.
          }
        } else if (message.type === "peer-left") {
          pcRef.current?.close();
          pcRef.current = null;
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          setStatus("waiting");
        }
      };
    }

    start();

    return () => {
      cancelled = true;
      wsRef.current?.close(1000);
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [roomName, token, wsBaseUrl]);

  function toggleMic() {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((v) => !v);
  }

  function toggleCam() {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((v) => !v);
  }

  function hangUp() {
    wsRef.current?.close(1000);
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    router.push(returnPath);
  }

  const showOverlay = status !== "connected";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-neutral-950">
      <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />

      {showOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950/90 text-center text-neutral-100">
          {(status === "connecting" || status === "waiting" || status === "negotiating") && (
            <Loader2 className="size-8 animate-spin text-neutral-400" />
          )}
          <p className="text-sm text-neutral-300">{STATUS_LABEL[status]}</p>
          {status === "error" && (
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          )}
        </div>
      )}

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute right-4 bottom-24 h-32 w-24 rounded-xl object-cover shadow-lg ring-1 ring-white/10 sm:h-40 sm:w-32"
      />

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-neutral-900/80 px-4 py-3 backdrop-blur">
        <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic}>
          {micOn ? <Mic /> : <MicOff />}
        </Button>
        <Button size="icon" variant={camOn ? "secondary" : "destructive"} onClick={toggleCam}>
          {camOn ? <Video /> : <VideoOff />}
        </Button>
        <Button size="icon" variant="destructive" onClick={hangUp}>
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
