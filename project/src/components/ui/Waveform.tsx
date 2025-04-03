import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  audioUrl: string;
  type: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const Waveform: React.FC<WaveformProps> = ({
  type,
  isPlaying,
  currentTime,
  duration,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw timeline
    const lineY = canvas.height / (2 * window.devicePixelRatio);
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(canvas.width / window.devicePixelRatio, lineY);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw playhead circle
    if (duration > 0) {
      const progress = currentTime / duration;
      const circleX = (canvas.width / window.devicePixelRatio) * progress;
      const circleRadius = 12;

      // Draw outer glow
      const gradient = ctx.createRadialGradient(
        circleX, lineY, circleRadius / 2,
        circleX, lineY, circleRadius * 1.5
      );
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.5)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.beginPath();
      ctx.arc(circleX, lineY, circleRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw circle
      ctx.beginPath();
      ctx.arc(circleX, lineY, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw inner circle
      ctx.beginPath();
      ctx.arc(circleX, lineY, circleRadius / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }, [currentTime, duration, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-16 cursor-pointer"
      style={{ touchAction: 'none' }}
    />
  );
};

export default Waveform;