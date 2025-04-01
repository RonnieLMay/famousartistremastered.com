import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  audioUrl: string;
  type: 'classic' | 'bars' | 'line' | 'circle';
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const Waveform: React.FC<WaveformProps> = ({
  audioUrl,
  type,
  isPlaying,
  currentTime,
  duration,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    audio.addEventListener('canplay', () => {
      if (!audioContextRef.current || !analyserRef.current) return;
      
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      sourceRef.current = source;
    });

    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyserRef.current.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height);

      switch (type) {
        case 'bars':
          drawBars(ctx, dataArray, width, height);
          break;
        case 'line':
          drawLine(ctx, dataArray, width, height);
          break;
        case 'circle':
          drawCircle(ctx, dataArray, width, height);
          break;
        default:
          drawClassic(ctx, dataArray, width, height);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type]);

  const drawClassic = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number
  ) => {
    const barWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const y = height - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, height);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(1, '#7C3AED');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      x += barWidth;
    }
  };

  const drawBars = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number
  ) => {
    const barCount = 64;
    const barWidth = width / barCount;
    const step = Math.floor(dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step];
      const barHeight = (value / 255) * height;
      const x = i * barWidth;
      const y = height - barHeight;

      ctx.fillStyle = `hsl(${(i / barCount) * 240}, 70%, 50%)`;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }
  };

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number
  ) => {
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) / 3;
    const bars = 180;
    const step = Math.floor(dataArray.length / bars);

    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step];
      const barHeight = (value / 255) * (radius / 2);
      const angle = (i / bars) * Math.PI * 2;

      const x1 = center.x + Math.cos(angle) * radius;
      const y1 = center.y + Math.sin(angle) * radius;
      const x2 = center.x + Math.cos(angle) * (radius + barHeight);
      const y2 = center.y + Math.sin(angle) * (radius + barHeight);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsl(${(i / bars) * 360}, 70%, 50%)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-40 rounded-lg bg-black/20 backdrop-blur-sm"
      width={800}
      height={160}
    />
  );
};

export default Waveform;