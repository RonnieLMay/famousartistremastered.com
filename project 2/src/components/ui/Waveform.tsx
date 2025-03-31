import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  audioUrl: string;
  onPlayPause?: (isPlaying: boolean) => void;
}

interface AudioContext extends BaseAudioContext {
  state: string;
  resume(): Promise<void>;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl, onPlayPause }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        sourceNodeRef.current = audioContextRef.current.createBufferSource();
        sourceNodeRef.current.buffer = audioBuffer;
        sourceNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };

    setupAudio();

    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [audioUrl]);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 255, 0)';
    ctx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
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

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  const togglePlayPause = async () => {
    if (!audioContextRef.current || !sourceNodeRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (!isPlaying) {
      sourceNodeRef.current.start();
      drawWaveform();
    } else {
      sourceNodeRef.current.stop();
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsPlaying(!isPlaying);
    onPlayPause?.(!isPlaying);
  };

  return (
    <div className="relative w-full h-40">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={togglePlayPause}
        style={{ cursor: 'pointer' }}
      />
      <button
        className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={togglePlayPause}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default Waveform;