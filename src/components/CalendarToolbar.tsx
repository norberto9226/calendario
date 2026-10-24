import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Search, 
  X,
  Plus
} from 'lucide-react';
import { CalendarViewMode } from '../types/calendar';
import { SeasonConfig } from '../types/season';
import { MONTH_NAMES_ES } from '../utils/dateUtils';

interface CalendarToolbarProps {
  currentYear: number;
  currentMonthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToDate: (year: number, monthIndex: number) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalEventsCount: number;
  filteredEventsCount: number;
  seasonConfig: SeasonConfig;
  onNewEvent?: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentYear,
  currentMonthIndex,
  onPrevMonth,
  onNextMonth,
  onJumpToDate,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  totalEventsCount,
  filteredEventsCount,
  seasonConfig,
  onNewEvent,
}) => {
  const isSeptember2026 = currentYear === 2026 && currentMonthIndex === 8;

  return (
    <div className="pb-4 pt-1 transition-colors duration-300">
      {/* Top row: Date navigation & View mode switch */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 transition-colors"
        style={{ borderColor: seasonConfig.borderHex }}
      >
        {/* Month Navigator */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div 
            className="flex items-center rounded-lg p-1 border transition-colors"
            style={{
              backgroundColor: seasonConfig.headerBgHex,
              borderColor: seasonConfig.borderHex,
            }}
          >
            <button
              onClick={onPrevMonth}
              className="p-1.5 rounded-md hover:bg-white transition-colors"
              style={{ color: seasonConfig.textColor }}
              title="Mes anterior"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onNextMonth}
              className="p-1.5 rounded-md hover:bg-white transition-colors"
              style={{ color: seasonConfig.textColor }}
              title="Mes siguiente"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-baseline gap-2">
            <h1 
              className="font-serif text-2xl sm:text-3xl font-bold tracking-tight transition-colors"
              style={{ color: seasonConfig.textColor }}
            >
              {MONTH_NAMES_ES[currentMonthIndex]}
            </h1>
            <span 
              className="font-serif text-xl sm:text-2xl font-normal transition-colors"
              style={{ color: seasonConfig.mutedTextColor }}
            >
              {currentYear}
            </span>
          </div>

          {/* Peru season badge */}
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all shadow-2xs"
            style={{
              backgroundColor: seasonConfig.cardBgHex,
              borderColor: seasonConfig.borderHex,
              color: seasonConfig.primaryColor,
            }}
            title={`Estación astronómica oficial en Perú: ${seasonConfig.name}`}
          >
            <span className="text-sm">🇵🇪</span>
            <span>{seasonConfig.emoji}</span>
            <span>{seasonConfig.name}</span>
          </span>

          {!isSeptember2026 && (
            <button
              onClick={() => onJumpToDate(2026, 8)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors border shadow-2xs"
              style={{
                color: seasonConfig.primaryColor,
                backgroundColor: seasonConfig.cardBgHex,
                borderColor: seasonConfig.borderHex,
              }}
              title="Volver a Septiembre 2026"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sept 2026</span>
            </button>
          )}

          {/* Quick Year / Month dropdown selectors */}
          <div 
            className="hidden xl:flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: seasonConfig.mutedTextColor }}
          >
            <select
              value={currentMonthIndex}
              onChange={(e) => onJumpToDate(currentYear, parseInt(e.target.value, 10))}
              className="border rounded px-2 py-1 text-xs font-medium focus:outline-none transition-colors"
              style={{
                backgroundColor: seasonConfig.cardBgHex,
                borderColor: seasonConfig.borderStrongHex,
                color: seasonConfig.textColor,
              }}
            >
              {MONTH_NAMES_ES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => onJumpToDate(parseInt(e.target.value, 10), currentMonthIndex)}
              className="border rounded px-2 py-1 text-xs font-medium focus:outline-none transition-colors"
              style={{
                backgroundColor: seasonConfig.cardBgHex,
                borderColor: seasonConfig.borderStrongHex,
                color: seasonConfig.textColor,
              }}
            >
              {[2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode buttons & Register Event button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
          <div 
            className="flex items-center p-1 rounded-lg border transition-colors"
            style={{
              backgroundColor: seasonConfig.headerBgHex,
              borderColor: seasonConfig.borderHex,
            }}
          >
            {(
              [
                { id: 'mes', label: 'Mes' },
                { id: 'semana', label: 'Semana' },
              ] as const
            ).map((tab) => {
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onViewModeChange(tab.id)}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                    isActive ? 'bg-white shadow-sm font-bold' : 'hover:opacity-80'
                  }`}
                  style={{
                    color: isActive ? seasonConfig.primaryColor : seasonConfig.textColor,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {onNewEvent && (
            <button
              type="button"
              onClick={onNewEvent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm hover:shadow-md transition-all transform active:scale-95 whitespace-nowrap shrink-0"
              style={{
                backgroundColor: seasonConfig.primaryColor,
              }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Registrar Evento</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Search and Counter */}
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md min-w-[200px]">
          <Search 
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" 
            style={{ color: seasonConfig.mutedTextColor }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar eventos por título, lugar..."
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border rounded-lg focus:outline-none transition-colors"
            style={{
              borderColor: seasonConfig.borderStrongHex,
              color: seasonConfig.textColor,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
              style={{ color: seasonConfig.textColor }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter & Clear search */}
        <div 
          className="text-xs flex items-center gap-3 transition-colors"
          style={{ color: seasonConfig.mutedTextColor }}
        >
          <span>
            <strong style={{ color: seasonConfig.textColor }}>{filteredEventsCount}</strong> de {totalEventsCount} eventos
          </span>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="hover:underline font-medium"
              style={{ color: seasonConfig.primaryColor }}
            >
              Restablecer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
