import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface AudioControlsProps {
  fileUrl: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({ fileUrl }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.preload = 'metadata';

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      let errorMessage = 'Failed to load audio.';
      
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio playback was aborted.';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'A network error occurred while loading the audio.';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'The audio format is not supported by your browser.';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'The audio format or source is not supported.';
            break;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    audio.volume = volume;

    // Add cache-busting parameter and set source
    const url = new URL(fileUrl);
    url.searchParams.append('t', Date.now().toString());
    audio.src = url.toString();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [fileUrl]);

  const togglePlay = async () => {
    if (!audioRef.current || isLoading) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
      setError(null);
    } catch (err) {
      console.error('Playback error:', err);
      setIsPlaying(false);
      setError('Failed to play audio. Please try again.');
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current || isLoading) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.volume = newMuted ? 0 : volume || 1;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      const newVolume = 1;
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const retryLoad = () => {
    if (!audioRef.current) return;
    
    const url = new URL(fileUrl);
    url.searchParams.append('t', Date.now().toString());
    audioRef.current.src = url.toString();
    audioRef.current.load();
    setIsLoading(true);
    setError(null);
  };

  if (error) {
    return (
      <div className="w-full p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={retryLoad}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-blue-400 text-sm">Loading audio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          disabled={isLoading}
          className="h-8 w-8 text-white hover:text-blue-400 disabled:opacity-50"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div className="text-sm text-gray-400 w-20 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          disabled={isLoading}
          className="h-8 w-8 text-white hover:text-blue-400 disabled:opacity-50"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          disabled={isLoading}
          className="w-24"
        />
      </div>
    </div>
  );
};

export default AudioControls;