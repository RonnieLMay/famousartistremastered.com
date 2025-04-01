import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  audioUrl: string;
  type: string;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWaveform = (audioBuffer: AudioBuffer) => {
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / canvas.width);
      const amp = canvas.height / 2;

      const drawFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgb(66, 135, 245)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        switch (type) {
          case 'bars':
            const barWidth = 2;
            const barGap = 1;
            const totalBars = Math.floor(canvas.width / (barWidth + barGap));
            const samplesPerBar = Math.floor(data.length / totalBars);

            for (let i = 0; i < totalBars; i++) {
              let sum = 0;
              for (let j = 0; j < samplesPerBar; j++) {
                sum += Math.abs(data[i * samplesPerBar + j]);
              }
              const average = sum / samplesPerBar;
              const barHeight = average * amp;

              const x = i * (barWidth + barGap);
              ctx.fillStyle = `rgba(66, 135, 245, ${0.5 + average})`;
              ctx.fillRect(x, amp - barHeight / 2, barWidth, barHeight);
            }
            break;

          case 'line':
            ctx.moveTo(0, amp);
            for (let i = 0; i < canvas.width; i++) {
              let sum = 0;
              for (let j = 0; j < step; j++) {
                sum += Math.abs(data[i * step + j]);
              }
              const average = sum / step;
              ctx.lineTo(i, amp + average * amp * 0.8);
            }
            ctx.stroke();
            break;

          case 'circle':
            const radius = Math.min(canvas.width, canvas.height) / 4;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const totalPoints = 360;
            const samplesPerPoint = Math.floor(data.length / totalPoints);

            for (let i = 0; i < totalPoints; i++) {
              let sum = 0;
              for (let j = 0; j < samplesPerPoint; j++) {
                sum += Math.abs(data[i * samplesPerPoint + j]);
              }
              const average = sum / samplesPerPoint;
              const angle = (i * Math.PI * 2) / totalPoints;
              const r = radius + average * radius * 0.8;
              
              const x = centerX + Math.cos(angle) * r;
              const y = centerY + Math.sin(angle) * r;
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.closePath();
            ctx.strokeStyle = 'rgba(66, 135, 245, 0.8)';
            ctx.stroke();
            break;

          default: // classic
            ctx.moveTo(0, amp);
            for (let i = 0; i < canvas.width; i++) {
              let min = 1.0;
              let max = -1.0;
              for (let j = 0; j < step; j++) {
                const datum = data[i * step + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
              }
              ctx.lineTo(i, amp + min * amp * 0.8);
              ctx.lineTo(i, amp + max * amp * 0.8);
            }
            ctx.stroke();
        }

        // Draw playback position line if audio is playing
        if (isPlaying && audioElementRef.current) {
          const currentTime = audioElementRef.current.currentTime;
          const duration = audioElementRef.current.duration;
          const position = (currentTime / duration) * canvas.width;

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.lineWidth = 2;
          ctx.moveTo(position, 0);
          ctx.lineTo(position, canvas.height);
          ctx.stroke();
        }

        if (isPlaying) {
          animationFrameRef.current = requestAnimationFrame(drawFrame);
        }
      };

      drawFrame();
    };

    const loadAndDrawWaveform = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        drawWaveform(audioBuffer);

        // Set up audio element for playback tracking
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio(audioUrl);
          audioElementRef.current.addEventListener('play', () => setIsPlaying(true));
          audioElementRef.current.addEventListener('pause', () => setIsPlaying(false));
          audioElementRef.current.addEventListener('ended', () => setIsPlaying(false));
        }
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    loadAndDrawWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.removeEventListener('play', () => setIsPlaying(true));
        audioElementRef.current.removeEventListener('pause', () => setIsPlaying(false));
        audioElementRef.current.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, [audioUrl, type, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[120px] rounded-xl bg-black/20 backdrop-blur-sm"
      width={800}
      height={120}
    />
  );
};

export default Waveform;