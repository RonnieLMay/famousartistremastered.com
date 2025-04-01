import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "./button";
import { Slider } from "./slider";

interface AudioControlsProps {
  fileUrl: string;
  onPlaybackChange: (isPlaying: boolean) => void;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  fileUrl,
  onPlaybackChange,
  onTimeUpdate,
  onDurationChange,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
      }
    };
  }, []);

  const handleCanPlayThrough = () => {
    setIsLoaded(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      onDurationChange(audioDuration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onPlaybackChange(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlayPause = () => {
    if (!isLoaded || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Playback failed:", error);
        setIsPlaying(false);
        onPlaybackChange(false);
      });
    }
    setIsPlaying(!isPlaying);
    onPlaybackChange(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!isLoaded || !audioRef.current) return;

    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    onTimeUpdate(newTime);
  };

  const handleSkipBack = () => {
    if (!isLoaded || !audioRef.current) return;

    const newTime = Math.max(0, currentTime - 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    onTimeUpdate(newTime);
  };

  const handleSkipForward = () => {
    if (!isLoaded || !audioRef.current) return;

    const newTime = Math.min(duration, currentTime + 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    onTimeUpdate(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <audio 
        ref={audioRef} 
        src={fileUrl} 
        preload="metadata"
        autoPlay={false}
      />
      
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSkipBack}
          disabled={!isLoaded}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <SkipBack className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          disabled={!isLoaded}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSkipForward}
          disabled={!isLoaded}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 min-w-[40px]">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={handleSeek}
          disabled={!isLoaded}
          className="flex-1"
        />
        <span className="text-sm text-gray-400 min-w-[40px]">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default AudioControls;