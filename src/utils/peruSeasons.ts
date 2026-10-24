import { SeasonTheme } from '../types/season';

/**
 * Retorna la estación oficial en Perú (Hemisferio Sur) según fecha y día:
 * - Verano: 21 de Diciembre al 20 de Marzo
 * - Otoño: 21 de Marzo al 21 de Junio
 * - Invierno: 22 de Junio al 22 de Septiembre
 * - Primavera: 23 de Septiembre al 21 de Diciembre
 */
export function getPeruSeason(year: number, monthIndex: number, day: number = 15): SeasonTheme {
  const m = monthIndex; // 0 = Ene, 1 = Feb, ..., 11 = Dic
  const d = day;

  // Verano: 21 Dic - 20 Mar
  if (m === 11 && d >= 21) return 'verano';
  if (m === 0 || m === 1) return 'verano';
  if (m === 2 && d <= 20) return 'verano';

  // Otoño: 21 Mar - 21 Jun
  if (m === 2 && d >= 21) return 'otono';
  if (m === 3 || m === 4) return 'otono';
  if (m === 5 && d <= 21) return 'otono';

  // Invierno: 22 Jun - 22 Sep
  if (m === 5 && d >= 22) return 'invierno';
  if (m === 6 || m === 7) return 'invierno';
  if (m === 8 && d <= 22) return 'invierno';

  // Primavera: 23 Sep - 21 Dic
  if (m === 8 && d >= 23) return 'primavera';
  if (m === 9 || m === 10) return 'primavera';
  if (m === 11 && d < 21) return 'primavera';

  return 'primavera';
}

export function getPeruSeasonName(season: SeasonTheme): string {
  switch (season) {
    case 'verano':
      return 'Verano (Perú)';
    case 'otono':
      return 'Otoño (Perú)';
    case 'invierno':
      return 'Invierno (Perú)';
    case 'primavera':
      return 'Primavera (Perú)';
  }
}
