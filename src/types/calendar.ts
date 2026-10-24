export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
  location?: string;
  images: string[]; // User uploaded base64 data URLs or custom URLs
  audios?: { id: string; name: string; url: string; size?: string; duration?: number }[]; // User uploaded audio tracks or recordings
  createdAt: number;
}

export type CalendarViewMode = 'mes' | 'semana';
