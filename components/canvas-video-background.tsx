"use client";

import { useEffect, useRef } from "react";

interface CanvasVideoBackgroundProps {
  videoSrc: string;
  overlayOpacity?: number; // 0 to 1, optional
}

const CanvasVideoBackground: React.FC<CanvasVideoBackgroundProps> = ({
  videoSrc,
  overlayOpacity = 0.2, // default 0.2
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to container
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Draw video frames with dynamic black overlay
    const draw = () => {
      if (video.paused || video.ended) return;

      // Draw video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Dynamic black overlay
      ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      requestAnimationFrame(draw);
    };

    video.play().catch(() => {});
    draw();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [videoSrc, overlayOpacity]);

  return (
    <div className="absolute inset-0 w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className="hidden"
      />
    </div>
  );
};

export default CanvasVideoBackground;
