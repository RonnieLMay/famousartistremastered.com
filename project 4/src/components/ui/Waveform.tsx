import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  audioUrl: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, onLoad, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        if (!audioUrl) return;

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        const audioContext = audioContextRef.current;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 2048;

        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }

        sourceRef.current = audioContext.createBufferSource();
        sourceRef.current.buffer = audioBuffer;
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);

        drawWaveform();
        onLoad?.();
      } catch (err) {
        console.error('Error loading audio:', err);
        onError?.(err instanceof Error ? err : new Error('Failed to load audio'));
      }
    };

    setupAudio();

    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [audioUrl, onLoad, onError]);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(5, 8, 22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(59, 130, 246)';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-24 rounded-lg bg-[#050816]"
      width={800}
      height={100}
    />
  );
};

export default Waveform;