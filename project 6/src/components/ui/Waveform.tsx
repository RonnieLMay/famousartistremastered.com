import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
  duration
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const initializeAudio = async () => {
      if (!canvasRef.current) return;

      try {
        // Create audio context
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;

        // Fetch and decode audio
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        // Create and connect source
        sourceRef.current = audioContextRef.current.createBufferSource();
        sourceRef.current.buffer = audioBuffer;
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        // Start visualization
        draw();
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initializeAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawFrame = () => {
      animationFrameRef.current = requestAnimationFrame(drawFrame);
      analyserRef.current?.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(5, 8, 22, 0.2)';
      ctx.fillRect(0, 0, width, height);

      switch (type) {
        case 'classic':
          drawClassicWaveform(ctx, width, height, dataArray);
          break;
        case 'bars':
          drawBars(ctx, width, height, dataArray);
          break;
        case 'line':
          drawLine(ctx, width, height, dataArray);
          break;
        case 'circle':
          drawCircle(ctx, width, height, dataArray);
          break;
      }
    };

    drawFrame();
  };

  const drawClassicWaveform = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array
  ) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(66, 135, 245, 0.8)';
    ctx.beginPath();

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
    ctx.stroke();
  };

  const drawBars = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array
  ) => {
    const barWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, 'rgba(66, 135, 245, 0.8)');
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0.8)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    const points: Array<{ x: number; y: number }> = [];
    const sliceWidth = width / dataArray.length;

    for (let i = 0; i < dataArray.length; i++) {
      const x = i * sliceWidth;
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      points.push({ x, y });
    }

    ctx.strokeStyle = 'rgba(66, 135, 245, 0.8)';
    ctx.lineWidth = 2;

    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    ctx.stroke();
  };

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(66, 135, 245, 0.8)';
    ctx.lineWidth = 2;

    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = dataArray[i] / 255;
      const angle = (i / dataArray.length) * Math.PI * 2;
      const x = centerX + (radius + amplitude * 50) * Math.cos(angle);
      const y = centerY + (radius + amplitude * 50) * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();
  };

  return (
    <motion.div
      className="w-full aspect-[3/1] rounded-lg overflow-hidden glass-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={900}
        height={300}
      />
    </motion.div>
  );
};

export default Waveform;