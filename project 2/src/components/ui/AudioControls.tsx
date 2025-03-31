import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from './slider';
import { Button } from './button';

interface AudioControlsProps {
  fileUrl: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({ fileUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (newValue: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = newValue[0];
    setCurrentTime(newValue[0]);
  };

  const handleVolumeChange = (newValue: number[]) => {
    if (!audioRef.current) return;
    const newVolume = newValue[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.volume = newMuted ? 0 : volume;
    setIsMuted(newMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4">
      <audio ref={audioRef} src={fileUrl} preload="metadata" />
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="hover:bg-blue-500/20"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-blue-400" />
          ) : (
            <Play className="h-6 w-6 text-blue-400" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={handleTimeChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="hover:bg-blue-500/20"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-blue-400" />
            ) : (
              <Volume2 className="h-5 w-5 text-blue-400" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;