import { CalendarEvent } from '../types/calendar';

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAYS_OF_WEEK_ES = [
  { short: 'Lun', full: 'Lunes' },
  { short: 'Mar', full: 'Martes' },
  { short: 'Mié', full: 'Miércoles' },
  { short: 'Jue', full: 'Jueves' },
  { short: 'Vie', full: 'Viernes' },
  { short: 'Sáb', full: 'Sábado' },
  { short: 'Dom', full: 'Domingo' }
];

export interface CalendarDayCell {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  month: number; // 0-indexed
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  dayOfWeek: number; // 0 for Monday, 6 for Sunday
}

/**
 * Returns formatted "YYYY-MM-DD"
 */
export function formatDateString(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Parses YYYY-MM-DD string to year, month, day components
 */
export function parseDateString(dateStr: string) {
  const parts = dateStr.split('-');
  return {
    year: parseInt(parts[0], 10),
    monthIndex: parseInt(parts[1], 10) - 1,
    day: parseInt(parts[2], 10)
  };
}

/**
 * Formats date into natural Spanish string, e.g. "Sábado, 12 de septiembre de 2026"
 */
export function formatFullDateEs(dateStr: string): string {
  const { year, monthIndex, day } = parseDateString(dateStr);
  const dateObj = new Date(year, monthIndex, day);
  const dayOfWeekIndex = (dateObj.getDay() + 6) % 7; // Convert Sun=0..Sat=6 to Mon=0..Sun=6
  const dayName = DAYS_OF_WEEK_ES[dayOfWeekIndex]?.full || '';
  const monthName = MONTH_NAMES_ES[monthIndex]?.toLowerCase() || '';
  return `${dayName}, ${day} de ${monthName} de ${year}`;
}

/**
 * Build days grid for month view (Monday through Sunday)
 */
export function getMonthDaysGrid(year: number, monthIndex: number, referenceToday: string): CalendarDayCell[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Day of week for 1st day (0 = Mon, 6 = Sun)
  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Previous month padding
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevMonthYear = monthIndex === 0 ? year - 1 : year;

  const cells: CalendarDayCell[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const dateStr = formatDateString(prevMonthYear, prevMonthIndex, dayNum);
    const dayOfWeek = (firstDayOfWeek - 1 - i) % 7;
    cells.push({
      date: dateStr,
      dayNumber: dayNum,
      month: prevMonthIndex,
      year: prevMonthYear,
      isCurrentMonth: false,
      isToday: dateStr === referenceToday,
      isWeekend: dayOfWeek >= 5,
      dayOfWeek
    });
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const dateStr = formatDateString(year, monthIndex, dayNum);
    const dayOfWeek = (cells.length) % 7;
    cells.push({
      date: dateStr,
      dayNumber: dayNum,
      month: monthIndex,
      year,
      isCurrentMonth: true,
      isToday: dateStr === referenceToday,
      isWeekend: dayOfWeek >= 5,
      dayOfWeek
    });
  }

  // 3. Next month leading days to complete standard 35 or 42 grid cells
  const remainingCells = (cells.length % 7 === 0) ? 0 : 7 - (cells.length % 7);
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextMonthYear = monthIndex === 11 ? year + 1 : year;

  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const dateStr = formatDateString(nextMonthYear, nextMonthIndex, dayNum);
    const dayOfWeek = (cells.length) % 7;
    cells.push({
      date: dateStr,
      dayNumber: dayNum,
      month: nextMonthIndex,
      year: nextMonthYear,
      isCurrentMonth: false,
      isToday: dateStr === referenceToday,
      isWeekend: dayOfWeek >= 5,
      dayOfWeek
    });
  }

  return cells;
}

/**
 * Get 7 days for a given date in a week (starting on Monday)
 */
export function getWeekDays(referenceDate: string, todayStr: string): CalendarDayCell[] {
  const { year, monthIndex, day } = parseDateString(referenceDate);
  const dateObj = new Date(year, monthIndex, day);
  const dayOfWeek = (dateObj.getDay() + 6) % 7; // Monday = 0

  // Start Monday
  const monday = new Date(year, monthIndex, day - dayOfWeek);
  const weekDays: CalendarDayCell[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dateStr = formatDateString(current.getFullYear(), current.getMonth(), current.getDate());
    const dow = (current.getDay() + 6) % 7;
    weekDays.push({
      date: dateStr,
      dayNumber: current.getDate(),
      month: current.getMonth(),
      year: current.getFullYear(),
      isCurrentMonth: current.getMonth() === monthIndex,
      isToday: dateStr === todayStr,
      isWeekend: dow >= 5,
      dayOfWeek: dow
    });
  }

  return weekDays;
}

/**
 * Generates an iCalendar (.ics) string for downloading
 */
export function generateICalendarData(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendario de Otono 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Calendario de Otono 2026'
  ];

  events.forEach(evt => {
    const cleanDate = evt.date.replace(/-/g, '');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${evt.id}@calendario-otono.local`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART;VALUE=DATE:${cleanDate}`);
    lines.push(`SUMMARY:${evt.title.replace(/[,;\\]/g, ' ')}`);
    if (evt.description) {
      lines.push(`DESCRIPTION:${evt.description.replace(/\n/g, '\\n')}`);
    }
    if (evt.location) {
      lines.push(`LOCATION:${evt.location.replace(/[,;\\]/g, ' ')}`);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Downloads a file to client
 */
export function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
