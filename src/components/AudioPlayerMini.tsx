import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Trash2 } from 'lucide-react';
import { SeasonConfig } from '../types/season';

interface AudioItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  duration?: number;
}

interface AudioPlayerMiniProps {
  audio: AudioItem;
  seasonConfig: SeasonConfig;
  onDelete?: () => void;
  compact?: boolean;
}

export const AudioPlayerMini: React.FC<AudioPlayerMiniProps> = ({
  audio,
  seasonConfig,
  onDelete,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => {
      if (el.duration && !isNaN(el.duration) && isFinite(el.duration)) {
        setDuration(el.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);
    el.addEventListener('pause', onPause);
    el.addEventListener('play', onPlay);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('play', onPlay);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error('Audio play error:', err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (compact) {
    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
        style={{
          backgroundColor: seasonConfig.cardBgHex,
          borderColor: seasonConfig.borderHex,
        }}
      >
        <audio ref={audioRef} src={audio.url} preload="metadata" />
        <button
          type="button"
          onClick={togglePlay}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 transition-transform active:scale-95 shadow-2xs"
          style={{ backgroundColor: seasonConfig.primaryColor }}
          title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white ml-0.5" />}
        </button>

        <span className="truncate max-w-[120px] font-medium" style={{ color: seasonConfig.textColor }}>
          {audio.name}
        </span>

        <span className="text-[10px] tabular-nums" style={{ color: seasonConfig.mutedTextColor }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="p-3 rounded-xl border flex flex-col gap-2 transition-all hover:shadow-2xs"
      style={{
        backgroundColor: seasonConfig.cardBgHex,
        borderColor: seasonConfig.borderStrongHex,
      }}
    >
      <audio ref={audioRef} src={audio.url} preload="metadata" />
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 transition-transform active:scale-95 shadow-2xs"
            style={{ backgroundColor: seasonConfig.primaryColor }}
            title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          
          <div className="min-w-0">
            <h5 
              className="text-xs font-semibold truncate transition-colors"
              style={{ color: seasonConfig.textColor }}
              title={audio.name}
            >
              {audio.name}
            </h5>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: seasonConfig.mutedTextColor }}>
              <span className="flex items-center gap-0.5">
                <Volume2 className="w-3 h-3" />
                <span>Audio adjunto</span>
              </span>
              {audio.size && <span>• {audio.size}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] tabular-nums font-mono font-medium" style={{ color: seasonConfig.primaryColor }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
              title="Eliminar este audio"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress seeker bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-100 rounded-full"
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: seasonConfig.primaryColor,
            }}
          />
        </div>
        <input 
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="absolute opacity-0 w-full h-4 cursor-pointer"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};
