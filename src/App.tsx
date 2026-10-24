import React, { useState, useEffect, useMemo } from 'react';
import { CalendarToolbar } from './components/CalendarToolbar';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { EventModal } from './components/EventModal';
import { DayDetailModal } from './components/DayDetailModal';
import { ImageLightbox } from './components/ImageLightbox';
import { SeasonalParticles } from './components/SeasonalParticles';
import { CountdownBanner } from './components/CountdownBanner';
import { MusicPlayer } from './components/MusicPlayer';
import { CalendarEvent, CalendarViewMode } from './types/calendar';
import { SeasonTheme, SEASONS_CONFIG } from './types/season';
import { INITIAL_EVENTS } from './data/presetEvents';
import { getPeruSeason } from './utils/peruSeasons';
import { 
  getMonthDaysGrid, 
  getWeekDays, 
  formatDateString 
} from './utils/dateUtils';

const STORAGE_KEY = 'autumn_calendar_user_clean_v3';

export default function App() {
  // Calendar navigation starts in September 2026 as requested!
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(8); // 8 = Septiembre
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-09-01');

  // Season automatically adapts according to Peru's seasons in the Southern Hemisphere
  const currentSeason = useMemo<SeasonTheme>(() => {
    let day = 15;
    if (selectedDayDate) {
      const [y, m, d] = selectedDayDate.split('-').map(Number);
      if (y === currentYear && m - 1 === currentMonthIndex) {
        day = d;
      } else if (currentMonthIndex === 8) {
        // En septiembre, Perú inicia la primavera el 23 de septiembre
        day = 23;
      }
    }
    return getPeruSeason(currentYear, currentMonthIndex, day);
  }, [currentYear, currentMonthIndex, selectedDayDate]);

  // View state
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mes');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ambient effects (enabled by default)
  const fallingLeavesEnabled = true;

  // Events list initialized from localStorage or defaults
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_EVENTS;
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      console.error('Error saving events to localStorage:', err);
    }
  }, [events]);

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [targetDateForNewEvent, setTargetDateForNewEvent] = useState<string>('2026-09-01');
  const [isDayDetailOpen, setIsDayDetailOpen] = useState<boolean>(false);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string>('');

  // Reference "Today" in 2026 context
  const referenceToday = '2026-10-16';

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonthIndex(11);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonthIndex(0);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleJumpToSeptember = () => {
    setCurrentYear(2026);
    setCurrentMonthIndex(8); // Septiembre
    setSelectedDayDate('2026-09-01');
  };

  const handleJumpToDate = (year: number, monthIndex: number) => {
    setCurrentYear(year);
    setCurrentMonthIndex(monthIndex);
  };

  // Week navigation
  const handlePrevWeek = () => {
    const parts = selectedDayDate.split('-');
    const curDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10) - 7);
    const newDateStr = formatDateString(curDate.getFullYear(), curDate.getMonth(), curDate.getDate());
    setSelectedDayDate(newDateStr);
    setCurrentYear(curDate.getFullYear());
    setCurrentMonthIndex(curDate.getMonth());
  };

  const handleNextWeek = () => {
    const parts = selectedDayDate.split('-');
    const curDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10) + 7);
    const newDateStr = formatDateString(curDate.getFullYear(), curDate.getMonth(), curDate.getDate());
    setSelectedDayDate(newDateStr);
    setCurrentYear(curDate.getFullYear());
    setCurrentMonthIndex(curDate.getMonth());
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchDesc = (evt.description || '').toLowerCase().includes(q);
        const matchLoc = (evt.location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) {
          return false;
        }
      }
      return true;
    });
  }, [events, searchQuery]);

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((evt) => {
      if (!map[evt.date]) {
        map[evt.date] = [];
      }
      map[evt.date].push(evt);
    });
    return map;
  }, [filteredEvents]);

  // Grid generation
  const monthGridDays = useMemo(() => {
    return getMonthDaysGrid(currentYear, currentMonthIndex, referenceToday);
  }, [currentYear, currentMonthIndex, referenceToday]);

  const weekGridDays = useMemo(() => {
    return getWeekDays(selectedDayDate, referenceToday);
  }, [selectedDayDate, referenceToday]);

  // Event CRUD
  const handleOpenNewEvent = (date?: string) => {
    const d = date || selectedDayDate || `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-01`;
    setTargetDateForNewEvent(d);
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setTargetDateForNewEvent(event.date);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (savedEvent: CalendarEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [savedEvent, ...prev];
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (editingEvent?.id === id) {
      setEditingEvent(null);
      setIsEventModalOpen(false);
    }
  };

  // Day selection
  const handleSelectDate = (date: string) => {
    setSelectedDayDate(date);
    setIsDayDetailOpen(true);
  };

  // Photo viewer lightbox
  const handleOpenImage = (url: string, title: string) => {
    setLightboxImage(url);
    setLightboxCaption(title);
  };

  const activeSeasonConfig = SEASONS_CONFIG[currentSeason];

  return (
    <div 
      data-season={currentSeason}
      className="min-h-screen flex flex-col relative transition-colors duration-500"
      style={{
        backgroundColor: activeSeasonConfig.bgHex,
        color: activeSeasonConfig.textColor,
      }}
    >
      {/* Ambient seasonal particles (leaves, petals, sparks, snow) */}
      <SeasonalParticles enabled={fallingLeavesEnabled} season={currentSeason} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 relative z-10">
        {/* Countdown to 14 February 2027 */}
        <CountdownBanner
          onJumpToDate={(year, monthIndex, day) => {
            setCurrentYear(year);
            setCurrentMonthIndex(monthIndex);
            setSelectedDayDate(formatDateString(year, monthIndex, day));
          }}
          onScheduleEvent={(targetDate) => handleOpenNewEvent(targetDate)}
          seasonConfig={activeSeasonConfig}
        />

        {/* Calendar Toolbar: Month/Year navigation, search, Peru season badge & view switcher */}
        <CalendarToolbar
          currentYear={currentYear}
          currentMonthIndex={currentMonthIndex}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onJumpToDate={handleJumpToDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalEventsCount={events.length}
          filteredEventsCount={filteredEvents.length}
          seasonConfig={activeSeasonConfig}
          onNewEvent={() => handleOpenNewEvent()}
        />

        {/* View render */}
        <div className="mt-2">
          {viewMode === 'mes' && (
            <MonthView
              days={monthGridDays}
              eventsByDate={eventsByDate}
              onSelectDate={handleSelectDate}
              onSelectEvent={handleEditEvent}
              onAddEventToDate={handleOpenNewEvent}
              onOpenImage={handleOpenImage}
              seasonConfig={activeSeasonConfig}
            />
          )}

          {viewMode === 'semana' && (
            <WeekView
              days={weekGridDays}
              eventsByDate={eventsByDate}
              onSelectEvent={handleEditEvent}
              onAddEventToDate={handleOpenNewEvent}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onOpenImage={handleOpenImage}
              seasonConfig={activeSeasonConfig}
            />
          )}
        </div>

        {/* Reproductor de Música con paleta estacional debajo del Calendario */}
        <MusicPlayer seasonConfig={activeSeasonConfig} />
      </main>

      {/* Footer */}
      <footer 
        className="mt-12 border-t py-6 px-4 sm:px-8 text-center text-xs transition-colors duration-300"
        style={{
          borderColor: activeSeasonConfig.borderHex,
          backgroundColor: `${activeSeasonConfig.cardBgHex}A0`,
          color: activeSeasonConfig.mutedTextColor,
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            Calendario 2026 · Fondo actual: <strong style={{ color: activeSeasonConfig.primaryColor }}>{activeSeasonConfig.name} {activeSeasonConfig.emoji}</strong> ({activeSeasonConfig.subtitle})
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={handleJumpToSeptember}
              className="hover:opacity-80 transition-opacity"
              style={{ color: activeSeasonConfig.primaryColor }}
            >
              Ir a Septiembre 2026
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Lightboxes */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={editingEvent}
        defaultDate={targetDateForNewEvent}
        seasonConfig={activeSeasonConfig}
      />

      <DayDetailModal
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        date={selectedDayDate}
        events={eventsByDate[selectedDayDate] || []}
        onAddEvent={handleOpenNewEvent}
        onSelectEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onOpenImage={handleOpenImage}
        seasonConfig={activeSeasonConfig}
      />

      <ImageLightbox
        isOpen={Boolean(lightboxImage)}
        onClose={() => {
          setLightboxImage(null);
          setLightboxCaption('');
        }}
        imageUrl={lightboxImage}
        caption={lightboxCaption}
      />
    </div>
  );
}
