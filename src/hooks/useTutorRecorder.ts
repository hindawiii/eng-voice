import { useCallback, useRef, useState } from "react";

/**
 * Zero-cost client-side audio recorder using MediaRecorder API.
 * Buffers locally; on stop returns a downloadable blob URL.
 */
export const useTutorRecorder = () => {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("audio/webm");

  const start = useCallback(async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mt = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      setMimeType(mt);
      const mr = new MediaRecorder(stream, { mimeType: mt });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.start(1000);
      recorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      console.error("Recorder start failed", err);
      throw err;
    }
  }, [recording]);

  const stop = useCallback(() => {
    return new Promise<string | null>((resolve) => {
      const mr = recorderRef.current;
      if (!mr) return resolve(null);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        resolve(url);
      };
      mr.stop();
    });
  }, [mimeType]);

  const reset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    chunksRef.current = [];
  }, [downloadUrl]);

  return { recording, downloadUrl, mimeType, start, stop, reset };
};
