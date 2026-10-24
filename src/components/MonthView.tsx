import React from 'react';
import { Plus, Image as ImageIcon, Music } from 'lucide-react';
import { CalendarDayCell, DAYS_OF_WEEK_ES } from '../utils/dateUtils';
import { CalendarEvent } from '../types/calendar';
import { SeasonConfig } from '../types/season';

interface MonthViewProps {
  days: CalendarDayCell[];
  eventsByDate: Record<string, CalendarEvent[]>;
  onSelectDate: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEventToDate: (date: string) => void;
  onOpenImage: (imageUrl: string, title: string) => void;
  seasonConfig: SeasonConfig;
}

export const MonthView: React.FC<MonthViewProps> = ({
  days,
  eventsByDate,
  onSelectDate,
  onSelectEvent,
  onAddEventToDate,
  onOpenImage,
  seasonConfig,
}) => {
  return (
    <div 
      className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300"
      style={{ borderColor: seasonConfig.borderHex }}
    >
      {/* Weekdays header */}
      <div 
        className="grid grid-cols-7 border-b text-center transition-colors"
        style={{
          backgroundColor: seasonConfig.headerBgHex,
          borderColor: seasonConfig.borderHex,
        }}
      >
        {DAYS_OF_WEEK_ES.map((d, index) => (
          <div
            key={d.short}
            className="py-2.5 px-1 text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{
              color: index >= 5 ? seasonConfig.primaryColor : seasonConfig.textColor,
            }}
          >
            <span className="hidden sm:inline">{d.full}</span>
            <span className="sm:hidden">{d.short}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div 
        className="grid grid-cols-7 auto-rows-fr gap-px transition-colors"
        style={{ backgroundColor: seasonConfig.borderHex }}
      >
        {days.map((cell) => {
          const dayEvents = eventsByDate[cell.date] || [];
          const visibleEvents = dayEvents.slice(0, 3);
          const hiddenCount = dayEvents.length - 3;
          const hasImages = dayEvents.some((e) => e.images && e.images.length > 0);
          const firstImage = dayEvents.find((e) => e.images && e.images.length > 0)?.images[0];

          return (
            <div
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 transition-colors relative flex flex-col justify-between group cursor-pointer ${
                !cell.isCurrentMonth
                  ? 'text-opacity-50'
                  : 'bg-white'
              }`}
              style={{
                backgroundColor: !cell.isCurrentMonth
                  ? `${seasonConfig.cardBgHex}80`
                  : cell.isWeekend
                  ? `${seasonConfig.cardBgHex}E6`
                  : '#FFFFFF',
              }}
            >
              {/* Day header: number, badges & quick add button */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-serif text-sm sm:text-base font-semibold transition-all ${
                      cell.isToday
                        ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white flex items-center justify-center text-xs sm:text-sm font-bold shadow-xs'
                        : ''
                    }`}
                    style={{
                      backgroundColor: cell.isToday ? seasonConfig.primaryColor : 'transparent',
                      color: cell.isToday
                        ? '#FFFFFF'
                        : cell.isCurrentMonth
                        ? seasonConfig.textColor
                        : seasonConfig.mutedTextColor,
                    }}
                  >
                    {cell.dayNumber}
                  </span>

                  {cell.isToday && (
                    <span 
                      className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider transition-colors"
                      style={{ color: seasonConfig.primaryColor }}
                    >
                      Hoy
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Photo thumbnail indicator if day has images */}
                  {hasImages && firstImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenImage(firstImage, `Foto del ${cell.date}`);
                      }}
                      className="relative group/thumb rounded overflow-hidden border transition-colors"
                      style={{ borderColor: seasonConfig.borderStrongHex }}
                      title="Ver foto de este día"
                    >
                      <img
                        src={firstImage}
                        alt="Foto del evento"
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 sm:w-6 sm:h-6 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent" />
                    </button>
                  )}

                  {/* Quick Add Button on Hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEventToDate(cell.date);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all hover:bg-black/5"
                    style={{ color: seasonConfig.primaryColor }}
                    title="Añadir evento a este día"
                    aria-label={`Añadir evento el ${cell.date}`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Event pills container */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {visibleEvents.map((event) => {
                  const hasPhoto = event.images && event.images.length > 0;

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className="group/pill flex items-center justify-between gap-1 px-2 py-1 rounded text-[11px] sm:text-xs font-medium transition-all hover:scale-[1.01] hover:shadow-xs cursor-pointer truncate border-l-3 border-y border-r"
                      style={{
                        backgroundColor: seasonConfig.pillBg,
                        borderLeftColor: seasonConfig.primaryColor,
                        borderColor: seasonConfig.pillBorder,
                        color: seasonConfig.pillText,
                      }}
                      title={event.title}
                    >
                      <span className="truncate">{event.title}</span>

                      <div className="flex items-center gap-1 shrink-0">
                        {event.audios && event.audios.length > 0 && (
                          <span title="Contiene audio adjunto" className="inline-flex">
                            <Music 
                              className="w-3 h-3 opacity-80 group-hover/pill:opacity-100" 
                              style={{ color: seasonConfig.primaryColor }}
                            />
                          </span>
                        )}
                        {hasPhoto && (
                          <span title="Contiene foto adjunta" className="inline-flex">
                            <ImageIcon 
                              className="w-3 h-3 opacity-75 group-hover/pill:opacity-100" 
                              style={{ color: seasonConfig.primaryColor }}
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* More events indicator */}
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(cell.date);
                    }}
                    className="w-full text-left text-[10px] font-semibold px-1 py-0.5 rounded transition-colors hover:underline"
                    style={{ color: seasonConfig.primaryColor }}
                  >
                    +{hiddenCount} más...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
