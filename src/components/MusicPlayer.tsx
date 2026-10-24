import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Flame, 
  Wind, 
  Coffee,
  ListMusic
} from 'lucide-react';
import { SeasonConfig } from '../types/season';

interface Track {
  id: string;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  icon: 'rain' | 'fire' | 'wind' | 'coffee';
  natureNoiseType: 'rain' | 'fire' | 'wind' | 'coffee';
  chordType: number[]; // notes in Hz
}

interface MusicPlayerProps {
  seasonConfig: SeasonConfig;
}

const TRACKS: Track[] = [
  {
    id: 'rain-autumn',
    title: 'Tarde de Lluvia & Piano Cálido',
    subtitle: 'Gotas suaves en la ventana y notas acústicas de otoño',
    duration: 215, // 3:35
    icon: 'rain',
    natureNoiseType: 'rain',
    chordType: [261.63, 329.63, 392.00, 523.25], // C Major
  },
  {
    id: 'fire-crackling',
    title: 'Chimenea & Leña Crepitante',
    subtitle: 'Calor de hogar, chisporroteo de leña y ambiente rústico',
    duration: 198, // 3:18
    icon: 'fire',
    natureNoiseType: 'fire',
    chordType: [220.00, 277.18, 329.63, 440.00], // A minor / D
  },
  {
    id: 'wind-leaves',
    title: 'Viento en el Hayedo Dorado',
    subtitle: 'Brisa fresca entre hojas secas y suaves acordes de guitarra',
    duration: 240, // 4:00
    icon: 'wind',
    natureNoiseType: 'wind',
    chordType: [196.00, 246.94, 293.66, 392.00], // G Major
  },
  {
    id: 'coffee-lofi',
    title: 'Café, Especias & Melodía Acústica',
    subtitle: 'Ambiente tranquilo de cafetería con notas de canela',
    duration: 184, // 3:04
    icon: 'coffee',
    natureNoiseType: 'coffee',
    chordType: [174.61, 220.00, 261.63, 349.23], // F Major
  },
];

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ seasonConfig }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const melodyTimerRef = useRef<number | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Helper to init AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = isMuted ? 0 : volume * 0.25;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Stop current Web Audio synthesis
  const stopAudio = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as AudioBufferSourceNode).stop();
      } catch {
        // already stopped
      }
      noiseNodeRef.current = null;
    }
    if (melodyTimerRef.current) {
      window.clearInterval(melodyTimerRef.current);
      melodyTimerRef.current = null;
    }
  };

  // Play ambient audio generation
  const startAudio = (track: Track) => {
    const ctx = getAudioContext();
    stopAudio();

    if (!masterGainRef.current) return;

    // 1. Generate ambient noise buffer (rain / fireplace crackle / gentle wind)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (track.natureNoiseType === 'fire') {
        output[i] = (Math.random() * 2 - 1) * (Math.random() > 0.985 ? 0.9 : 0.08);
      } else if (track.natureNoiseType === 'rain') {
        output[i] = (Math.random() * 2 - 1) * 0.35;
      } else if (track.natureNoiseType === 'wind') {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.12;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter noise for cozy warmth
    const filter = ctx.createBiquadFilter();
    if (track.natureNoiseType === 'fire') {
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 1.2;
    } else if (track.natureNoiseType === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 650;
    }

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.25;

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGainRef.current);
    whiteNoise.start();
    noiseNodeRef.current = whiteNoise;

    // 2. Play subtle soothing acoustic piano/chime chords periodically
    const playChord = () => {
      const currentMasterGain = masterGainRef.current;
      if (!ctx || ctx.state !== 'running' || !currentMasterGain) return;

      const baseFrequencies = track.chordType;
      baseFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Warm triangle wave for mellow acoustic tone
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        // Gentle envelope (soft attack, slow decay)
        const noteFilter = ctx.createBiquadFilter();
        noteFilter.type = 'lowpass';
        noteFilter.frequency.value = 900;

        noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), ctx.currentTime + 0.15 + idx * 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8 + idx * 0.1);

        osc.connect(noteFilter);
        noteFilter.connect(noteGain);
        noteGain.connect(currentMasterGain);

        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + 3.2);
      });
    };

    // Play initial chord and schedule recurring musical phrases
    playChord();
    melodyTimerRef.current = window.setInterval(() => {
      playChord();
    }, 4200);
  };

  // Handle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(currentTrack);
      setIsPlaying(true);
    }
  };

  // Next / Previous track
  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    setProgress(0);
    if (isPlaying) {
      startAudio(TRACKS[nextIdx]);
    }
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prevIdx);
    setProgress(0);
    if (isPlaying) {
      startAudio(TRACKS[prevIdx]);
    }
  };

  // Select track from list
  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setProgress(0);
    if (isPlaying) {
      startAudio(TRACKS[index]);
    } else {
      startAudio(TRACKS[index]);
      setIsPlaying(true);
    }
  };

  // Progress ticker
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= currentTrack.duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  // Volume & Mute handling
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume * 0.25;
      masterGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.05);
    }
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressPercentage = (progress / currentTrack.duration) * 100;

  const renderTrackIcon = (type: Track['icon'], className: string) => {
    switch (type) {
      case 'rain':
        return <CloudRain className={className} />;
      case 'fire':
        return <Flame className={className} />;
      case 'wind':
        return <Wind className={className} />;
      case 'coffee':
        return <Coffee className={className} />;
    }
  };

  return (
    <div 
      className="mt-8 rounded-2xl border p-4 sm:p-5 shadow-xs transition-colors duration-300"
      style={{
        backgroundColor: seasonConfig.cardBgHex,
        borderColor: seasonConfig.borderHex,
      }}
    >
      {/* Top player bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Track Info with rotating vinyl or pulsing sound icon */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all"
            style={{
              backgroundColor: isPlaying ? seasonConfig.primaryColor : seasonConfig.primaryLight,
              color: isPlaying ? '#FFFFFF' : seasonConfig.primaryColor,
              borderColor: seasonConfig.borderStrongHex,
            }}
          >
            {renderTrackIcon(currentTrack.icon, 'w-6 h-6')}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors"
                style={{
                  color: seasonConfig.primaryColor,
                  backgroundColor: seasonConfig.primaryLight,
                  borderColor: seasonConfig.borderHex,
                }}
              >
                Música & Sonidos de {seasonConfig.name}
              </span>
              {isPlaying && (
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-3 animate-pulse rounded" style={{ backgroundColor: seasonConfig.primaryColor }} />
                  <span className="w-0.5 h-2 animate-pulse delay-75 rounded" style={{ backgroundColor: seasonConfig.primaryColor }} />
                  <span className="w-0.5 h-3.5 animate-pulse delay-150 rounded" style={{ backgroundColor: seasonConfig.primaryColor }} />
                  <span className="w-0.5 h-2 animate-pulse delay-200 rounded" style={{ backgroundColor: seasonConfig.primaryColor }} />
                </div>
              )}
            </div>

            <h3 
              className="font-serif text-base sm:text-lg font-bold truncate mt-0.5 transition-colors"
              style={{ color: seasonConfig.textColor }}
            >
              {currentTrack.title}
            </h3>
            <p 
              className="text-xs truncate transition-colors"
              style={{ color: seasonConfig.mutedTextColor }}
            >
              {currentTrack.subtitle}
            </p>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center md:items-center gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevTrack}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: seasonConfig.textColor }}
              title="Pista anterior"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-sm hover:shadow-md transition-all transform active:scale-95"
              style={{ backgroundColor: seasonConfig.primaryColor }}
              title={isPlaying ? 'Pausar música' : 'Reproducir música'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: seasonConfig.textColor }}
              title="Pista siguiente"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Volume & Playlist Drawer Toggle */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          {/* Volume slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              style={{ color: isMuted ? seasonConfig.primaryColor : seasonConfig.textColor }}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 sm:w-20 h-1.5 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: seasonConfig.primaryColor }}
              title="Volumen"
            />
          </div>

          {/* Playlist button */}
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
            style={{
              backgroundColor: showPlaylist ? seasonConfig.primaryColor : '#FFFFFF',
              color: showPlaylist ? '#FFFFFF' : seasonConfig.textColor,
              borderColor: showPlaylist ? seasonConfig.primaryColor : seasonConfig.borderStrongHex,
            }}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Pistas ({TRACKS.length})</span>
          </button>
        </div>
      </div>

      {/* Progress timeline bar */}
      <div className="mt-3 pt-2 flex items-center gap-2">
        <span 
          className="text-[10px] font-mono tabular-nums w-8 text-right transition-colors"
          style={{ color: seasonConfig.mutedTextColor }}
        >
          {formatSeconds(progress)}
        </span>

        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            setProgress(Math.floor(clickPos * currentTrack.duration));
          }}
          className="flex-1 h-2 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all relative"
          style={{ backgroundColor: seasonConfig.borderHex }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: seasonConfig.primaryColor,
            }}
          />
        </div>

        <span 
          className="text-[10px] font-mono tabular-nums w-8 transition-colors"
          style={{ color: seasonConfig.mutedTextColor }}
        >
          {formatSeconds(currentTrack.duration)}
        </span>
      </div>

      {/* Playlist Selector Tray (collapsible) */}
      {showPlaylist && (
        <div 
          className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn transition-colors"
          style={{ borderColor: seasonConfig.borderHex }}
        >
          {TRACKS.map((track, idx) => {
            const isCurrent = idx === currentTrackIndex;
            return (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(idx)}
                className="p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all"
                style={{
                  backgroundColor: isCurrent ? seasonConfig.primaryLight : '#FFFFFF',
                  borderColor: isCurrent ? seasonConfig.primaryColor : seasonConfig.borderHex,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: isCurrent ? seasonConfig.primaryColor : seasonConfig.cardBgHex,
                    color: isCurrent ? '#FFFFFF' : seasonConfig.mutedTextColor,
                  }}
                >
                  {renderTrackIcon(track.icon, 'w-4 h-4')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold truncate transition-colors"
                      style={{
                        color: isCurrent ? seasonConfig.primaryColor : seasonConfig.textColor,
                      }}
                    >
                      {track.title}
                    </span>
                    <span 
                      className="text-[10px] font-mono transition-colors"
                      style={{ color: seasonConfig.mutedTextColor }}
                    >
                      {formatSeconds(track.duration)}
                    </span>
                  </div>
                  <p 
                    className="text-[11px] truncate transition-colors"
                    style={{ color: seasonConfig.mutedTextColor }}
                  >
                    {track.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
