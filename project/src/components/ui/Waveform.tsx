import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
  fileUrl: string;
}

const Waveform: React.FC<WaveformProps> = ({ fileUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    let source: AudioBufferSourceNode | null = null;
    let analyser: AnalyserNode | null = null;

    const drawWaveform = (audioBuffer: AudioBuffer) => {
      const width = canvas.width;
      const height = canvas.height;
      const channelData = audioBuffer.getChannelData(0);
      const step = Math.ceil(channelData.length / width);
      const amp = height / 2;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.strokeStyle = '#4a9eff';
      ctx.lineWidth = 2;

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = channelData[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        ctx.lineTo(i, (1 + min) * amp);
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = channelData[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        ctx.lineTo(i, (1 + max) * amp);
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    const loadAndDraw = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to load audio file');
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        drawWaveform(audioBuffer);
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing audio:', err);
        setError('Unable to display waveform visualization');
        setIsLoading(false);
      }
    };

    loadAndDraw();

    return () => {
      if (source) {
        source.stop();
        source.disconnect();
      }
      if (analyser) {
        analyser.disconnect();
      }
      audioContext.close();
    };
  }, [fileUrl]);

  if (error) {
    return (
      <motion.div
        className="w-full h-[200px] rounded-lg bg-gray-900 flex items-center justify-center text-red-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {error}
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        className="w-full h-[200px] rounded-lg bg-gray-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </motion.div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full rounded-lg bg-gray-900"
    />
  );
};

export default Waveform;