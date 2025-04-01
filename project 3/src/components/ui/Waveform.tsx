import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  audioUrl: string;
  color?: string;
  height?: number;
}

const Waveform: React.FC<WaveformProps> = ({
  audioUrl,
  color = '#4F46E5',
  height = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      audioRef.current = new Audio(audioUrl);
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        animationFrameRef.current = requestAnimationFrame(draw);

        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(5, 8, 22, 0.2)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * HEIGHT;

          ctx.fillStyle = color;
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      };

      audioRef.current.play();
      draw();
    } catch (error) {
      console.error('Error initializing audio visualization:', error);
    }

    return cleanup;
  }, [audioUrl, color]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={height}
      className="w-full rounded-lg"
    />
  );
};

export default Waveform;