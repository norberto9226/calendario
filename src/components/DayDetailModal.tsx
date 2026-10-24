import React, { useState } from 'react';
import { X, Plus, MapPin, Image as ImageIcon, Calendar, Edit3, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../types/calendar';
import { SeasonConfig } from '../types/season';
import { formatFullDateEs } from '../utils/dateUtils';
import { AudioPlayerMini } from './AudioPlayerMini';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  events: CalendarEvent[];
  onAddEvent: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onOpenImage: (url: string, title: string) => void;
  seasonConfig: SeasonConfig;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  events,
  onAddEvent,
  onSelectEvent,
  onDeleteEvent,
  onOpenImage,
  seasonConfig,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Collect all photos for this day
  const allDayImages = events.flatMap((e) =>
    e.images.map((img) => ({ url: img, eventTitle: e.title }))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div 
        className="rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transition-colors"
        style={{
          backgroundColor: seasonConfig.cardBgHex,
          borderColor: seasonConfig.borderStrongHex,
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between transition-colors"
          style={{
            backgroundColor: seasonConfig.headerBgHex,
            borderColor: seasonConfig.borderHex,
          }}
        >
          <div>
            <span 
              className="text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{ color: seasonConfig.primaryColor }}
            >
              Detalle del Día
            </span>
            <h2 
              className="font-serif text-xl sm:text-2xl font-bold capitalize transition-colors"
              style={{ color: seasonConfig.textColor }}
            >
              {formatFullDateEs(date)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: seasonConfig.mutedTextColor }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top action row */}
          <div className="flex items-center justify-between">
            <span 
              className="text-xs font-semibold transition-colors"
              style={{ color: seasonConfig.mutedTextColor }}
            >
              {events.length} {events.length === 1 ? 'evento programado' : 'eventos programados'}
            </span>
            <button
              onClick={() => {
                onClose();
                onAddEvent(date);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors shadow-2xs"
              style={{ backgroundColor: seasonConfig.primaryColor }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Evento</span>
            </button>
          </div>

          {/* Events list */}
          {events.length === 0 ? (
            <div 
              className="py-10 text-center bg-white rounded-xl border transition-colors"
              style={{ borderColor: seasonConfig.borderHex }}
            >
              <Calendar 
                className="w-8 h-8 mx-auto opacity-50 mb-2 transition-colors" 
                style={{ color: seasonConfig.primaryColor }}
              />
              <p 
                className="text-sm font-semibold transition-colors"
                style={{ color: seasonConfig.textColor }}
              >
                No hay eventos en este día
              </p>
              <p 
                className="text-xs mt-1 mb-3 transition-colors"
                style={{ color: seasonConfig.mutedTextColor }}
              >
                ¿Deseas programar una actividad o registrar fotos?
              </p>
              <button
                onClick={() => {
                  onClose();
                  onAddEvent(date);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
                style={{
                  color: seasonConfig.primaryColor,
                  backgroundColor: seasonConfig.primaryLight,
                  borderColor: seasonConfig.borderHex,
                }}
              >
                Crear Evento Aquí
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-xl border bg-white transition-all hover:shadow-xs border-l-4"
                    style={{
                      borderLeftColor: seasonConfig.primaryColor,
                      borderColor: seasonConfig.borderHex,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        {event.location && (
                          <div 
                            className="text-xs flex items-center gap-1 transition-colors"
                            style={{ color: seasonConfig.mutedTextColor }}
                          >
                            <MapPin className="w-3 h-3" style={{ color: seasonConfig.primaryColor }} />
                            <span>{event.location}</span>
                          </div>
                        )}

                        <h4 
                          className="font-serif text-base font-bold transition-colors"
                          style={{ color: seasonConfig.textColor }}
                        >
                          {event.title}
                        </h4>

                        {event.description && (
                          <p 
                            className="text-xs leading-relaxed whitespace-pre-line transition-colors"
                            style={{ color: seasonConfig.textColor }}
                          >
                            {event.description}
                          </p>
                        )}

                        {event.audios && event.audios.length > 0 && (
                          <div className="pt-2 space-y-1.5">
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
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectEvent(event);
                          }}
                          className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                          style={{ color: seasonConfig.textColor }}
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {confirmDeleteId === event.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-xs">
                            <span className="text-[11px] font-semibold text-rose-800">¿Eliminar?</span>
                            <button
                              onClick={() => {
                                onDeleteEvent(event.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 text-[11px] text-stone-600 hover:bg-stone-200 rounded transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(event.id)}
                            className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Photos of the day */}
          {allDayImages.length > 0 && (
            <div 
              className="pt-4 border-t transition-colors"
              style={{ borderColor: seasonConfig.borderHex }}
            >
              <div 
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-3 transition-colors"
                style={{ color: seasonConfig.primaryColor }}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galería de Fotos del Día ({allDayImages.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allDayImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenImage(img.url, img.eventTitle)}
                    className="group relative rounded-xl overflow-hidden aspect-4/3 cursor-pointer border shadow-2xs hover:shadow-md transition-all"
                    style={{ borderColor: seasonConfig.borderStrongHex }}
                  >
                    <img
                      src={img.url}
                      alt={img.eventTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[11px] font-medium text-white truncate">
                        {img.eventTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-3 border-t flex justify-end transition-colors"
          style={{
            backgroundColor: seasonConfig.headerBgHex,
            borderColor: seasonConfig.borderHex,
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors hover:bg-black/5"
            style={{ color: seasonConfig.textColor }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
