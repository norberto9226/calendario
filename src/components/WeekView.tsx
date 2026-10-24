import React from 'react';
import { Plus, MapPin, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { CalendarDayCell } from '../utils/dateUtils';
import { CalendarEvent } from '../types/calendar';
import { SeasonConfig } from '../types/season';
import { AudioPlayerMini } from './AudioPlayerMini';

interface WeekViewProps {
  days: CalendarDayCell[];
  eventsByDate: Record<string, CalendarEvent[]>;
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEventToDate: (date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onOpenImage: (imageUrl: string, title: string) => void;
  seasonConfig: SeasonConfig;
}

export const WeekView: React.FC<WeekViewProps> = ({
  days,
  eventsByDate,
  onSelectEvent,
  onAddEventToDate,
  onPrevWeek,
  onNextWeek,
  onOpenImage,
  seasonConfig,
}) => {
  return (
    <div 
      className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300"
      style={{ borderColor: seasonConfig.borderHex }}
    >
      {/* Week Navigation Header */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between transition-colors"
        style={{
          backgroundColor: seasonConfig.headerBgHex,
          borderColor: seasonConfig.borderHex,
        }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{ color: seasonConfig.primaryColor }}
          >
            Vista Semanal
          </span>
          <span 
            className="text-sm font-medium transition-colors"
            style={{ color: seasonConfig.textColor }}
          >
            {days[0]?.dayNumber} al {days[6]?.dayNumber} de {days[0]?.month !== days[6]?.month ? 'meses compartidos' : 'este mes'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onPrevWeek}
            className="p-1 rounded-md hover:bg-white transition-colors"
            style={{ color: seasonConfig.textColor }}
            title="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextWeek}
            className="p-1 rounded-md hover:bg-white transition-colors"
            style={{ color: seasonConfig.textColor }}
            title="Semana siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 Columns Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x transition-colors"
        style={{ borderColor: seasonConfig.borderHex }}
      >
        {days.map((cell) => {
          const dayEvents = eventsByDate[cell.date] || [];

          return (
            <div
              key={cell.date}
              className="min-h-[420px] p-2.5 flex flex-col transition-colors"
              style={{
                backgroundColor: cell.isToday ? seasonConfig.primaryLight : '#FFFFFF',
              }}
            >
              {/* Day title & Add button */}
              <div 
                className="flex items-center justify-between pb-2 mb-2 border-b transition-colors"
                style={{ borderColor: seasonConfig.borderHex }}
              >
                <div className="flex items-baseline gap-1.5">
                  <span 
                    className="text-xs font-semibold uppercase transition-colors"
                    style={{ color: seasonConfig.mutedTextColor }}
                  >
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][cell.dayOfWeek]}
                  </span>
                  <span
                    className="font-serif text-lg font-bold transition-colors"
                    style={{
                      color: cell.isToday ? seasonConfig.primaryColor : seasonConfig.textColor,
                    }}
                  >
                    {cell.dayNumber}
                  </span>
                </div>

                <button
                  onClick={() => onAddEventToDate(cell.date)}
                  className="p-1 rounded-md transition-colors hover:bg-black/5"
                  style={{ color: seasonConfig.primaryColor }}
                  title={`Añadir evento el ${cell.date}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day events stack */}
              <div className="space-y-2 flex-1">
                {dayEvents.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-center">
                    <p 
                      className="text-[11px] italic transition-colors"
                      style={{ color: seasonConfig.mutedTextColor }}
                    >
                      Sin eventos
                    </p>
                  </div>
                ) : (
                  dayEvents.map((event) => {
                    const hasPhotos = event.images && event.images.length > 0;

                    return (
                      <div
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className="group p-2.5 rounded-xl border transition-all hover:shadow-md cursor-pointer flex flex-col gap-1.5 border-l-4"
                        style={{
                          backgroundColor: seasonConfig.pillBg,
                          borderColor: seasonConfig.borderHex,
                          borderLeftColor: seasonConfig.primaryColor,
                        }}
                      >
                        {/* Title */}
                        <div>
                          <h4 
                            className="text-xs font-semibold transition-colors line-clamp-2"
                            style={{ color: seasonConfig.textColor }}
                          >
                            {event.title}
                          </h4>
                        </div>

                        {/* Location if any */}
                        {event.location && (
                          <div 
                            className="flex items-center gap-1 text-[10px] truncate transition-colors"
                            style={{ color: seasonConfig.mutedTextColor }}
                          >
                            <MapPin className="w-2.5 h-2.5 shrink-0" style={{ color: seasonConfig.primaryColor }} />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {/* Audios preview in week card */}
                        {event.audios && event.audios.length > 0 && (
                          <div className="space-y-1">
                            {event.audios.map((audio) => (
                              <AudioPlayerMini
                                key={audio.id}
                                audio={audio}
                                seasonConfig={seasonConfig}
                                compact={true}
                              />
                            ))}
                          </div>
                        )}

                        {/* Photos preview in week card */}
                        {hasPhotos && (
                          <div 
                            className="mt-1 pt-1 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-none transition-colors"
                            style={{ borderColor: seasonConfig.borderHex }}
                          >
                            {event.images.map((imgUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenImage(imgUrl, event.title);
                                }}
                                className="relative rounded overflow-hidden shrink-0 border transition-colors"
                                style={{ borderColor: seasonConfig.borderStrongHex }}
                              >
                                <img
                                  src={imgUrl}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 object-cover hover:scale-105 transition-transform"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
