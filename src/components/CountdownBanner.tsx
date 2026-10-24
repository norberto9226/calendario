import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Sparkles } from 'lucide-react';
import { SeasonConfig } from '../types/season';

interface CountdownBannerProps {
  onJumpToDate?: (year: number, monthIndex: number, day: number) => void;
  onScheduleEvent?: (date: string) => void;
  seasonConfig: SeasonConfig;
}

interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  onJumpToDate,
  onScheduleEvent,
  seasonConfig,
}) => {
  // Target date: 14 de febrero de 2027 a las 00:00:00 hora local
  const TARGET_DATE = new Date(2027, 1, 14, 0, 0, 0).getTime();

  const calculateTimeRemaining = (): TimeRemaining => {
    const now = Date.now();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { total: difference, days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isCompleted = timeLeft.total <= 0;

  return (
    <div 
      className="mb-6 rounded-2xl border p-4 sm:p-5 relative overflow-hidden shadow-xs transition-colors duration-300"
      style={{
        backgroundColor: seasonConfig.cardBgHex,
        borderColor: seasonConfig.borderHex,
      }}
    >
      {/* Subtle decorative background watermark heart/season icon */}
      <div className="absolute right-2 top-0 bottom-0 w-64 pointer-events-none opacity-5 flex items-center justify-center">
        <Heart className="w-56 h-56" style={{ color: seasonConfig.primaryColor }} fill="currentColor" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left info column: Cuenta regresiva para nuestro encuentro */}
        <div className="flex items-center">
          <h2 
            className="font-serif text-lg sm:text-2xl font-bold tracking-tight transition-colors flex items-center gap-2.5"
            style={{ color: seasonConfig.textColor }}
          >
            <Heart 
              className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform duration-300 hover:scale-110" 
              style={{ color: seasonConfig.primaryColor }} 
              fill="currentColor" 
            />
            <span style={{ width: '448.693px', textAlign: 'center', fontSize: '22px' }}>
              {isCompleted ? '¡Llegó el día de nuestro encuentro!' : 'Cuenta regresiva para nuestro encuentro'}
            </span>
          </h2>
        </div>

        {/* Center / Right: Countdown digits & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Digits cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Days */}
            <div 
              className="bg-white/95 backdrop-blur-xs border rounded-xl px-2.5 py-2 min-w-[64px] shadow-2xs transition-colors"
              style={{ borderColor: seasonConfig.borderHex }}
            >
              <span 
                className="block font-serif text-2xl sm:text-3xl font-bold tabular-nums leading-none transition-colors"
                style={{ color: seasonConfig.primaryColor }}
              >
                {timeLeft.days}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: seasonConfig.mutedTextColor }}>
                Días
              </span>
            </div>

            {/* Hours */}
            <div 
              className="bg-white/95 backdrop-blur-xs border rounded-xl px-2.5 py-2 min-w-[64px] shadow-2xs transition-colors"
              style={{ borderColor: seasonConfig.borderHex }}
            >
              <span 
                className="block font-serif text-2xl sm:text-3xl font-bold tabular-nums leading-none transition-colors"
                style={{ color: seasonConfig.accentColor }}
              >
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: seasonConfig.mutedTextColor }}>
                Horas
              </span>
            </div>

            {/* Minutes */}
            <div 
              className="bg-white/95 backdrop-blur-xs border rounded-xl px-2.5 py-2 min-w-[64px] shadow-2xs transition-colors"
              style={{ borderColor: seasonConfig.borderHex }}
            >
              <span 
                className="block font-serif text-2xl sm:text-3xl font-bold tabular-nums leading-none transition-colors"
                style={{ color: seasonConfig.primaryColor }}
              >
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: seasonConfig.mutedTextColor }}>
                Min
              </span>
            </div>

            {/* Seconds */}
            <div 
              className="bg-white/95 backdrop-blur-xs border rounded-xl px-2.5 py-2 min-w-[64px] shadow-2xs transition-colors"
              style={{ borderColor: seasonConfig.borderHex }}
            >
              <span 
                className="block font-serif text-2xl sm:text-3xl font-bold tabular-nums leading-none transition-colors"
                style={{ color: seasonConfig.accentColor }}
              >
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: seasonConfig.mutedTextColor }}>
                Seg
              </span>
            </div>
          </div>

          {/* Interactive actions */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            {onJumpToDate && (
              <button
                type="button"
                onClick={() => onJumpToDate(2027, 1, 14)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border rounded-lg transition-colors whitespace-nowrap hover:shadow-2xs"
                style={{
                  color: seasonConfig.textColor,
                  borderColor: seasonConfig.borderStrongHex,
                }}
                title="Ir a febrero 2027 en el calendario"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Ver en Calendario</span>
              </button>
            )}

            {onScheduleEvent && (
              <button
                type="button"
                onClick={() => onScheduleEvent('2027-02-14')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-2xs transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: seasonConfig.primaryColor,
                }}
                title="Crear un evento para el 14 de febrero de 2027"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Agendar Evento</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
