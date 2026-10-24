import React from 'react';
import { SeasonTheme } from '../types/season';

interface SeasonalParticlesProps {
  enabled: boolean;
  season: SeasonTheme;
}

interface ParticleData {
  id: number;
  left: number; // percentage
  delay: number; // seconds
  duration: number; // seconds
  size: number; // pixels
  rotation: number; // deg
}

const STATIC_PARTICLES: ParticleData[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  left: (i * 5.2 + 3) % 96,
  delay: (i * 0.7) % 8,
  duration: 9 + (i % 6) * 1.5,
  size: 14 + (i % 4) * 6,
  rotation: (i * 47) % 360,
}));

export const SeasonalParticles: React.FC<SeasonalParticlesProps> = ({ enabled, season }) => {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {STATIC_PARTICLES.map((p) => {
        let color = '#C25934';
        let svgContent = null;

        if (season === 'otono') {
          const colors = ['#C25934', '#D97706', '#A8421E', '#E07A2A', '#842F11'];
          color = colors[p.id % colors.length];
          // Maple or oak leaf
          svgContent = p.id % 2 === 0 ? (
            <path d="M12 2L13.8 6.5L18 5L16.5 9.5L21 11.5L17.5 14L19 19L14 17L12 22L10 17L5 19L6.5 14L3 11.5L7.5 9.5L6 5L10.2 6.5L12 2Z" />
          ) : (
            <path d="M12 2C10.5 4 8 4.5 8 7C8 8.5 9.5 9.5 8.5 11.5C7.5 13.5 6 14.5 6 17C6 19.5 8.5 21 12 22C15.5 21 18 19.5 18 17C18 14.5 16.5 13.5 15.5 11.5C14.5 9.5 16 8.5 16 7C16 4.5 13.5 4 12 2Z" />
          );
        } else if (season === 'primavera') {
          const colors = ['#E896B2', '#D95B82', '#F4B8CC', '#C44D76', '#EAA7C0'];
          color = colors[p.id % colors.length];
          // Sakura petal
          svgContent = (
            <path d="M12 2C8 5 6 9 8 15C9.5 19.5 12 22 12 22C12 22 14.5 19.5 16 15C18 9 16 5 12 2Z" />
          );
        } else if (season === 'verano') {
          const colors = ['#F59E0B', '#FBBF24', '#E07A18', '#FDE68A', '#D97706'];
          color = colors[p.id % colors.length];
          // Warm sunshine mote / spark
          svgContent = (
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          );
        } else {
          // Invierno: Snowflake
          const colors = ['#93C5FD', '#60A5FA', '#3B82F6', '#BFDBFE', '#7DD3FC'];
          color = colors[p.id % colors.length];
          svgContent = (
            <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
              <circle cx="12" cy="12" r="1.5" fill={color} />
            </g>
          );
        }

        return (
          <div
            key={p.id}
            className="absolute opacity-60 animate-leaf-fall"
            style={{
              left: `${p.left}%`,
              top: '-30px',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          >
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={season === 'invierno' ? 'none' : color}
              style={{
                transform: `rotate(${p.rotation}deg)`,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))',
              }}
            >
              {svgContent}
            </svg>
          </div>
        );
      })}
    </div>
  );
};
