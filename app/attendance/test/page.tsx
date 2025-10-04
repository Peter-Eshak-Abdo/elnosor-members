// QRScanner.tsx (React client component, "use client")
"use client";
import { useEffect, useRef } from "react";
import jsQR from "jsqr";

export default function QRScanner({ onDecode }: { onDecode: (data: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let streaming = false;
    let animationId: number;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          streaming = true;
          tick();
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("تعذّر الوصول للكاميرا. تأكد من الإذن وكونك على https.");
      }
    }
    function tick() {
      if (!streaming || !videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      if (code?.data) {
        onDecode(code.data);
        // بعد القراءة ممكن نوقف الكاميرا لو أردت:
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        streaming = false;
        return;
      }
      animationId = requestAnimationFrame(tick);
    }
    start();
    return () => {
      cancelAnimationFrame(animationId);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [onDecode]);
  return (
    <>
      <video ref={videoRef} style={{ width: "100%" }} playsInline />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}
