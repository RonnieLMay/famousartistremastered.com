import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
  audioUrl: string;
  type: 'classic' | 'bars' | 'line' | 'circle';
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
  };

  useEffect(() => {
    cleanup();

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElement.src = audioUrl;
    audioElementRef.current = audioElement;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const source = audioContext.createMediaElementSource(audioElement);
    sourceNodeRef.current = source;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawClassicWaveform = () => {
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = 'rgba(5, 8, 22, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(66, 135, 245)';
      ctx.beginPath();

      const sliceWidth = rect.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (rect.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(rect.width, rect.height / 2);
      
      // Add glow effect
      ctx.shadowColor = 'rgba(66, 135, 245, 0.5)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    };

    const drawBarsWaveform = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(5, 8, 22, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const barCount = 64;
      const barWidth = (rect.width / barCount) * 0.8;
      const barSpacing = (rect.width / barCount) * 0.2;
      const samplesPerBar = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < samplesPerBar; j++) {
          sum += dataArray[i * samplesPerBar + j];
        }
        const average = sum / samplesPerBar;
        const barHeight = (average / 255) * rect.height;
        const x = i * (barWidth + barSpacing);

        const gradient = ctx.createLinearGradient(0, rect.height, 0, rect.height - barHeight);
        gradient.addColorStop(0, 'rgba(66, 135, 245, 0.8)');
        gradient.addColorStop(1, 'rgba(147, 51, 234, 0.8)');

        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(66, 135, 245, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillRect(x, rect.height - barHeight, barWidth, barHeight);
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    };

    const drawCircleWaveform = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(5, 8, 22, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      const segments = 180;
      const angleStep = (Math.PI * 2) / segments;

      ctx.beginPath();
      for (let i = 0; i < segments; i++) {
        const amplitude = dataArray[i] / 255;
        const r = radius * (1 + amplitude * 0.3);
        const angle = i * angleStep;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.3);
      gradient.addColorStop(0, 'rgba(66, 135, 245, 0.8)');
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0.8)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(66, 135, 245, 0.5)';
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    };

    const drawLineWaveform = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(5, 8, 22, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const points: [number, number][] = [];
      const sliceWidth = rect.width / bufferLength;
      
      for (let i = 0; i < bufferLength; i++) {
        const x = i * sliceWidth;
        const v = dataArray[i] / 255;
        const y = rect.height - (v * rect.height);
        points.push([x, y]);
      }

      ctx.beginPath();
      ctx.moveTo(0, rect.height);
      
      // Draw the bottom line
      for (let i = 0; i < points.length; i++) {
        const [x, y] = points[i];
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const [xPrev, yPrev] = points[i - 1];
          const xMid = (x + xPrev) / 2;
          const yMid = (y + yPrev) / 2;
          ctx.quadraticCurveTo(xPrev, yPrev, xMid, yMid);
        }
      }

      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, 'rgba(66, 135, 245, 0.8)');
      gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.8)');
      gradient.addColorStop(1, 'rgba(66, 135, 245, 0.8)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(66, 135, 245, 0.5)';
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    };

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      switch (type) {
        case 'bars':
          drawBarsWaveform();
          break;
        case 'circle':
          drawCircleWaveform();
          break;
        case 'line':
          drawLineWaveform();
          break;
        default:
          drawClassicWaveform();
      }

      // Draw progress line
      if (audioElement) {
        const progress = audioElement.currentTime / audioElement.duration;
        const progressX = progress * rect.width;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, rect.height);
        ctx.stroke();
      }
    };

    const handlePlay = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      draw();
    };

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handlePause);

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    if (!audioElement.paused) {
      handlePlay();
    }

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handlePause);
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [audioUrl, type]);

  return (
    <motion.div 
      className="relative w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded-lg bg-[#050816]/50 backdrop-blur-sm"
      />
    </motion.div>
  );
};

export default Waveform;