import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  audioUrl: string;
}

interface WaveformState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
}

const Waveform: React.FC<WaveformProps> = ({ audioUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<WaveformState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0
  });

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    });

    audio.addEventListener('timeupdate', () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    });

    audio.addEventListener('ended', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  return (
    <div className="w-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-24 bg-gray-900/50 rounded-lg cursor-pointer"
        onClick={togglePlayPause}
      />
      <div className="flex justify-between mt-2 text-sm text-gray-400">
        <span>{formatTime(state.currentTime)}</span>
        <span>{formatTime(state.duration)}</span>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default Waveform;