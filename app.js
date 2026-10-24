/**
 * Calendario Perú 2026 - Vanilla JavaScript
 * Zero dependencies, pure static web application.
 */

// --- SEASONS CONFIGURATION (Peru - Southern Hemisphere) ---
const SEASONS_CONFIG = {
  otono: {
    id: 'otono',
    name: 'Otoño',
    emoji: '🍂',
    subtitle: 'Hojas doradas, terracota y calidez',
    bgHex: '#FAF6F0',
    cardBgHex: '#FDFBF8',
    headerBgHex: '#F7EFE6',
    borderHex: '#E8DCCF',
    borderStrongHex: '#DFCFC1',
    primaryColor: '#A8421E',
    primaryHover: '#8F3516',
    textColor: '#382417',
    mutedTextColor: '#8C6D58',
    particleType: 'leaf',
    musicTitle: 'Serenata Otoñal Andina'
  },
  primavera: {
    id: 'primavera',
    name: 'Primavera',
    emoji: '🌸',
    subtitle: 'Flores de cerezo, verde fresco y brisa',
    bgHex: '#FAF5F7',
    cardBgHex: '#FCF8FA',
    headerBgHex: '#F6EBF0',
    borderHex: '#EED6E0',
    borderStrongHex: '#E2C2D0',
    primaryColor: '#C44D76',
    primaryHover: '#A8385E',
    textColor: '#381C28',
    mutedTextColor: '#8C5B72',
    particleType: 'petal',
    musicTitle: 'Melodía Primaveral de los Andes'
  },
  verano: {
    id: 'verano',
    name: 'Verano',
    emoji: '☀️',
    subtitle: 'Luz dorada, cielo abierto y vitalidad',
    bgHex: '#FCFAF2',
    cardBgHex: '#FDFCF7',
    headerBgHex: '#F6F0E0',
    borderHex: '#EAE0C8',
    borderStrongHex: '#DECFAe',
    primaryColor: '#C96E14',
    primaryHover: '#AD590A',
    textColor: '#382410',
    mutedTextColor: '#876B4B',
    particleType: 'sun',
    musicTitle: 'Sol Radiante del Valle Sagrado'
  },
  invierno: {
    id: 'invierno',
    name: 'Invierno',
    emoji: '❄️',
    subtitle: 'Nieve serena, azul escarcha y silencio',
    bgHex: '#F2F6FA',
    cardBgHex: '#F7FAFC',
    headerBgHex: '#E4ECF5',
    borderHex: '#D2DFEC',
    borderStrongHex: '#BED0E2',
    primaryColor: '#1E649E',
    primaryHover: '#154E7D',
    textColor: '#182736',
    mutedTextColor: '#57718A',
    particleType: 'snow',
    musicTitle: 'Bruma y Escarcha de la Cordillera'
  }
};

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const WEEKDAY_FULL_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const STORAGE_KEY = 'autumn_calendar_user_clean_v3';

/**
 * Retorna la estación oficial en Perú (Hemisferio Sur)
 */
function getPeruSeason(year, monthIndex, day = 15) {
  const m = monthIndex;
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

function formatDateString(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDateString(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

// --- APP STATE ---
const state = {
  currentYear: 2026,
  currentMonthIndex: 8, // Septiembre (0-indexed: 8)
  selectedDayDate: '2026-09-01',
  viewMode: 'mes', // 'mes' | 'semana'
  searchQuery: '',
  events: [],
  editingEventId: null,
  modalImages: [], // array of base64 data URLs
  modalAudios: [], // array of { id, name, url, duration }
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  recordInterval: null,
  recordSeconds: 0,
  lightboxUrl: null,
  lightboxCaption: ''
};

// --- INITIALIZE DATA ---
function loadEventsFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        state.events = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('Error loading events:', err);
  }
  state.events = [];
}

function saveEventsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
  } catch (err) {
    console.error('Error saving events:', err);
  }
}

// Current Season Config computed from active month & selected date
function getActiveSeasonConfig() {
  let day = 15;
  if (state.selectedDayDate) {
    const p = parseDateString(state.selectedDayDate);
    if (p.year === state.currentYear && p.monthIndex === state.currentMonthIndex) {
      day = p.day;
    } else if (state.currentMonthIndex === 8) {
      day = 23; // Inicia la primavera en septiembre
    }
  }
  const seasonKey = getPeruSeason(state.currentYear, state.currentMonthIndex, day);
  return SEASONS_CONFIG[seasonKey] || SEASONS_CONFIG.primavera;
}

// Apply theme to DOM
function applySeasonTheme() {
  const cfg = getActiveSeasonConfig();
  const root = document.documentElement;

  root.style.setProperty('--primary-color', cfg.primaryColor);
  root.style.setProperty('--primary-hover', cfg.primaryHover);
  root.style.setProperty('--bg-color', cfg.bgHex);
  root.style.setProperty('--card-bg', cfg.cardBgHex);
  root.style.setProperty('--header-bg', cfg.headerBgHex);
  root.style.setProperty('--border-color', cfg.borderHex);
  root.style.setProperty('--border-strong', cfg.borderStrongHex);
  root.style.setProperty('--text-color', cfg.textColor);
  root.style.setProperty('--muted-text', cfg.mutedTextColor);

  document.body.style.backgroundColor = cfg.bgHex;
  document.body.style.color = cfg.textColor;

  // Header and Badges
  const badge = document.getElementById('peruSeasonBadge');
  if (badge) {
    badge.style.backgroundColor = cfg.cardBgHex;
    badge.style.borderColor = cfg.borderHex;
    badge.style.color = cfg.primaryColor;
  }
  const badgeEmoji = document.getElementById('badgeEmoji');
  if (badgeEmoji) badgeEmoji.textContent = cfg.emoji;
  const badgeName = document.getElementById('badgeName');
  if (badgeName) badgeName.textContent = cfg.name;

  // Jump to September button styling
  const btnJumpSept = document.getElementById('btnJumpSept');
  if (btnJumpSept) {
    btnJumpSept.style.color = cfg.primaryColor;
    btnJumpSept.style.backgroundColor = cfg.cardBgHex;
    btnJumpSept.style.borderColor = cfg.borderHex;
  }

  // Button New Event
  const btnNewEvent = document.getElementById('btnNewEvent');
  if (btnNewEvent) {
    btnNewEvent.style.backgroundColor = cfg.primaryColor;
  }

  // Music Player Box
  const musicBox = document.getElementById('musicPlayerContainer');
  if (musicBox) {
    musicBox.style.backgroundColor = cfg.cardBgHex;
    musicBox.style.borderColor = cfg.borderHex;
  }
  const musicIconBg = document.getElementById('musicIconBg');
  if (musicIconBg) {
    musicIconBg.style.backgroundColor = cfg.primaryColor;
  }
  const btnToggleMusic = document.getElementById('btnToggleMusic');
  if (btnToggleMusic) {
    btnToggleMusic.style.backgroundColor = cfg.primaryColor;
  }
  const musicTrackTitle = document.getElementById('musicTrackTitle');
  if (musicTrackTitle) {
    musicTrackTitle.textContent = cfg.musicTitle;
  }

  // Countdown Banner
  const countdownBanner = document.getElementById('countdownBanner');
  if (countdownBanner) {
    countdownBanner.style.backgroundColor = `${cfg.cardBgHex}FA`;
    countdownBanner.style.borderColor = cfg.borderHex;
  }
  const countdownIconBg = document.getElementById('countdownIconBg');
  if (countdownIconBg) {
    countdownIconBg.style.backgroundColor = `${cfg.primaryColor}15`;
    countdownIconBg.style.color = cfg.primaryColor;
  }

  // Footer
  const footer = document.getElementById('appFooter');
  if (footer) {
    footer.style.borderColor = cfg.borderHex;
    footer.style.backgroundColor = `${cfg.cardBgHex}A0`;
    footer.style.color = cfg.mutedTextColor;
  }
  const footerSeasonName = document.getElementById('footerSeasonName');
  if (footerSeasonName) {
    footerSeasonName.style.color = cfg.primaryColor;
    footerSeasonName.textContent = `${cfg.name} ${cfg.emoji}`;
  }
  const footerSeasonSub = document.getElementById('footerSeasonSub');
  if (footerSeasonSub) footerSeasonSub.textContent = cfg.subtitle;
  const btnFooterSept = document.getElementById('btnFooterSept');
  if (btnFooterSept) btnFooterSept.style.color = cfg.primaryColor;

  // View Mode container styling
  updateViewModeButtons();
}

// Update View Mode tabs
function updateViewModeButtons() {
  const cfg = getActiveSeasonConfig();
  const btnMes = document.getElementById('btnViewMes');
  const btnSemana = document.getElementById('btnViewSemana');
  const container = document.getElementById('viewModeContainer');

  if (container) {
    container.style.backgroundColor = cfg.headerBgHex;
    container.style.borderColor = cfg.borderHex;
  }

  if (state.viewMode === 'mes') {
    btnMes.className = 'px-3 sm:px-4 py-1.5 text-xs font-bold rounded-md bg-white shadow-sm transition-all cursor-pointer';
    btnMes.style.color = cfg.primaryColor;

    btnSemana.className = 'px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md hover:opacity-80 transition-all cursor-pointer';
    btnSemana.style.color = cfg.textColor;
  } else {
    btnSemana.className = 'px-3 sm:px-4 py-1.5 text-xs font-bold rounded-md bg-white shadow-sm transition-all cursor-pointer';
    btnSemana.style.color = cfg.primaryColor;

    btnMes.className = 'px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md hover:opacity-80 transition-all cursor-pointer';
    btnMes.style.color = cfg.textColor;
  }
}

// --- COUNTDOWN BANNER (14 FEBRERO 2027) ---
function initCountdown() {
  const targetDate = new Date('2027-02-14T00:00:00').getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById('countDays').textContent = '000';
      document.getElementById('countHours').textContent = '00';
      document.getElementById('countMins').textContent = '00';
      document.getElementById('countSecs').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    document.getElementById('countDays').textContent = String(days).padStart(3, '0');
    document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countMins').textContent = String(mins).padStart(2, '0');
    document.getElementById('countSecs').textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// --- FILTERED EVENTS & GROUPING ---
function getFilteredEvents() {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return state.events;

  return state.events.filter(e => {
    const tMatch = (e.title || '').toLowerCase().includes(q);
    const dMatch = (e.description || '').toLowerCase().includes(q);
    const lMatch = (e.location || '').toLowerCase().includes(q);
    return tMatch || dMatch || lMatch;
  });
}

function getEventsByDateMap() {
  const filtered = getFilteredEvents();
  const map = {};
  filtered.forEach(e => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return map;
}

// --- CALENDAR GRID GENERATION ---
function renderCalendar() {
  applySeasonTheme();

  // Update Toolbar Headings & Selectors
  document.getElementById('monthHeading').textContent = MONTH_NAMES_ES[state.currentMonthIndex];
  document.getElementById('yearHeading').textContent = state.currentYear;
  document.getElementById('selectMonth').value = state.currentMonthIndex;
  document.getElementById('selectYear').value = state.currentYear;

  // Events count text
  const filtered = getFilteredEvents();
  const total = state.events.length;
  const countText = state.searchQuery
    ? `${filtered.length} de ${total} eventos encontrados`
    : `${total} evento${total === 1 ? '' : 's'} registrado${total === 1 ? '' : 's'}`;
  document.getElementById('eventsCountText').textContent = countText;

  if (state.viewMode === 'mes') {
    document.getElementById('monthView').classList.remove('hidden');
    document.getElementById('weekView').classList.add('hidden');
    renderMonthView();
  } else {
    document.getElementById('monthView').classList.add('hidden');
    document.getElementById('weekView').classList.remove('hidden');
    renderWeekView();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- MONTH VIEW ---
function renderMonthView() {
  const container = document.getElementById('monthView');
  const cfg = getActiveSeasonConfig();
  const eventsMap = getEventsByDateMap();

  const year = state.currentYear;
  const month = state.currentMonthIndex;

  // Grid calculation (Monday-first or Sunday-first, Sunday first matches React version)
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Trailing previous month days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const prevDays = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    prevDays.push({
      dateStr: formatDateString(y, m, d),
      dayNumber: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  const currentDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentDays.push({
      dateStr: formatDateString(year, month, d),
      dayNumber: d,
      isCurrentMonth: true
    });
  }

  // Leading next month days
  const totalGridCells = 42; // 6 rows * 7 columns
  const nextCount = totalGridCells - (prevDays.length + currentDays.length);
  const nextDays = [];
  for (let d = 1; d <= nextCount; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    nextDays.push({
      dateStr: formatDateString(y, m, d),
      dayNumber: d,
      isCurrentMonth: false
    });
  }

  const allDays = [...prevDays, ...currentDays, ...nextDays];

  let html = `
    <div class="bg-white border rounded-2xl shadow-sm overflow-hidden" style="border-color: ${cfg.borderHex}">
      <!-- Weekday headers -->
      <div class="grid grid-cols-7 border-b text-center py-2.5 text-xs font-bold tracking-wider uppercase" 
           style="background-color: ${cfg.headerBgHex}; border-color: ${cfg.borderHex}; color: ${cfg.mutedTextColor}">
        ${WEEKDAY_NAMES_ES.map(w => `<div>${w}</div>`).join('')}
      </div>
      <!-- Days Grid -->
      <div class="grid grid-cols-7 auto-rows-fr divide-x divide-y" style="border-color: ${cfg.borderHex}">
  `;

  allDays.forEach(cell => {
    const isSelected = cell.dateStr === state.selectedDayDate;
    const dayEvents = eventsMap[cell.dateStr] || [];
    const hasEvents = dayEvents.length > 0;

    const cellBg = !cell.isCurrentMonth
      ? '#FAFAFA'
      : isSelected
      ? `${cfg.primaryColor}0C`
      : 'transparent';

    html += `
      <div 
        class="min-h-[95px] sm:min-h-[115px] p-1.5 sm:p-2 transition-all relative group cursor-pointer hover:bg-amber-500/5"
        style="background-color: ${cellBg}; border-color: ${cfg.borderHex}"
        onclick="handleDayClick('${cell.dateStr}')"
      >
        <!-- Day Number Header -->
        <div class="flex items-center justify-between mb-1">
          <span class="inline-flex items-center justify-center w-6 h-6 text-xs sm:text-sm font-semibold rounded-full transition-all ${
            isSelected
              ? 'text-white font-bold'
              : cell.isCurrentMonth
              ? 'text-gray-800'
              : 'text-gray-400 opacity-60'
          }" style="${isSelected ? `background-color: ${cfg.primaryColor};` : ''}">
            ${cell.dayNumber}
          </span>

          <!-- Quick Add Button on Hover -->
          <button 
            type="button"
            onclick="event.stopPropagation(); handleOpenNewEventModal('${cell.dateStr}')"
            class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white rounded-md transition-all shadow-2xs"
            style="--hover-bg: ${cfg.primaryColor}"
            onmouseover="this.style.backgroundColor='${cfg.primaryColor}'"
            onmouseout="this.style.backgroundColor='transparent'"
            title="Añadir evento a este día"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Event Pills -->
        <div class="space-y-1 overflow-hidden max-h-[75px]">
          ${dayEvents.slice(0, 3).map(evt => {
            const hasPhotos = evt.images && evt.images.length > 0;
            const hasAudios = evt.audios && evt.audios.length > 0;
            return `
              <div 
                onclick="event.stopPropagation(); handleEditEvent('${evt.id}')"
                class="px-1.5 py-0.5 rounded text-[11px] font-medium truncate flex items-center justify-between gap-1 border shadow-2xs hover:scale-[1.01] transition-transform"
                style="background-color: ${cfg.cardBgHex}; border-color: ${cfg.borderStrongHex}; color: ${cfg.textColor}"
                title="${escapeHtml(evt.title)}"
              >
                <span class="truncate">${escapeHtml(evt.title)}</span>
                <div class="flex items-center gap-0.5 shrink-0 text-gray-400">
                  ${hasPhotos ? `<i data-lucide="image" class="w-2.5 h-2.5"></i>` : ''}
                  ${hasAudios ? `<i data-lucide="music" class="w-2.5 h-2.5"></i>` : ''}
                </div>
              </div>
            `;
          }).join('')}
          ${dayEvents.length > 3 ? `
            <div class="text-[10px] font-semibold text-center text-gray-500 pt-0.5">
              +${dayEvents.length - 3} más
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// --- WEEK VIEW ---
function renderWeekView() {
  const container = document.getElementById('weekView');
  const cfg = getActiveSeasonConfig();
  const eventsMap = getEventsByDateMap();

  // Find start of week (Sunday) for state.selectedDayDate
  const current = new Date(state.selectedDayDate + 'T00:00:00');
  const dayOfWeek = current.getDay();
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - dayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      dateStr: formatDateString(d.getFullYear(), d.getMonth(), d.getDate()),
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      dayName: WEEKDAY_NAMES_ES[i],
      fullDayName: WEEKDAY_FULL_ES[i]
    });
  }

  let html = `
    <div class="bg-white border rounded-2xl shadow-sm overflow-hidden" style="border-color: ${cfg.borderHex}">
      <!-- Week Navigation Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b" style="background-color: ${cfg.headerBgHex}; border-color: ${cfg.borderHex}">
        <button onclick="handlePrevWeek()" class="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-white border hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer">
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
          <span>Semana anterior</span>
        </button>
        <div class="text-xs sm:text-sm font-semibold font-serif text-gray-700">
          ${weekDays[0].day} ${MONTH_NAMES_ES[weekDays[0].month]} — ${weekDays[6].day} ${MONTH_NAMES_ES[weekDays[6].month]} ${weekDays[6].year}
        </div>
        <button onclick="handleNextWeek()" class="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-white border hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer">
          <span>Semana siguiente</span>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- 7 Columns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x" style="border-color: ${cfg.borderHex}">
  `;

  weekDays.forEach(day => {
    const dayEvents = eventsMap[day.dateStr] || [];
    const isSelected = day.dateStr === state.selectedDayDate;

    html += `
      <div class="min-h-[300px] flex flex-col p-3 transition-colors ${isSelected ? 'bg-amber-500/5' : ''}" style="border-color: ${cfg.borderHex}">
        <!-- Day Column Header -->
        <div class="flex items-center justify-between pb-2 mb-2 border-b" style="border-color: ${cfg.borderHex}">
          <div>
            <span class="block text-xs font-bold uppercase tracking-wider text-gray-500">${day.dayName}</span>
            <span class="text-base font-bold font-serif ${isSelected ? 'font-bold' : ''}" style="${isSelected ? `color: ${cfg.primaryColor}` : ''}">
              ${day.day} ${MONTH_NAMES_ES[day.month].slice(0, 3)}
            </span>
          </div>
          <button
            onclick="handleOpenNewEventModal('${day.dateStr}')"
            class="p-1 rounded-md text-gray-400 hover:text-white transition-colors cursor-pointer"
            onmouseover="this.style.backgroundColor='${cfg.primaryColor}'"
            onmouseout="this.style.backgroundColor='transparent'"
            title="Añadir evento a este día"
          >
            <i data-lucide="plus" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Events List -->
        <div class="space-y-2 flex-1 overflow-y-auto">
          ${dayEvents.map(evt => {
            const hasPhotos = evt.images && evt.images.length > 0;
            const hasAudios = evt.audios && evt.audios.length > 0;
            return `
              <div 
                onclick="handleEditEvent('${evt.id}')"
                class="p-2.5 rounded-xl border bg-white shadow-2xs hover:shadow-sm transition-all cursor-pointer space-y-1.5"
                style="border-color: ${cfg.borderStrongHex}"
              >
                <div class="flex items-start justify-between gap-1">
                  <h4 class="text-xs font-bold leading-tight" style="color: ${cfg.textColor}">
                    ${escapeHtml(evt.title)}
                  </h4>
                </div>

                ${evt.location ? `
                  <div class="flex items-center gap-1 text-[11px] text-gray-500">
                    <i data-lucide="map-pin" class="w-3 h-3 text-amber-700 shrink-0"></i>
                    <span class="truncate">${escapeHtml(evt.location)}</span>
                  </div>
                ` : ''}

                <!-- Mini Photo thumbnails preview -->
                ${hasPhotos ? `
                  <div class="flex gap-1 overflow-x-auto pt-1">
                    ${evt.images.slice(0, 3).map((img, idx) => `
                      <img 
                        src="${img}" 
                        alt="Foto" 
                        onclick="event.stopPropagation(); handleOpenLightbox('${img}', '${escapeHtml(evt.title)}')"
                        class="w-8 h-8 rounded object-cover border border-gray-200 hover:opacity-90"
                      />
                    `).join('')}
                    ${evt.images.length > 3 ? `
                      <span class="w-8 h-8 rounded bg-gray-100 text-[10px] flex items-center justify-center font-bold text-gray-500">
                        +${evt.images.length - 3}
                      </span>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Mini Audio preview -->
                ${hasAudios ? `
                  <div class="mt-1 pt-1 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span class="flex items-center gap-1">
                      <i data-lucide="mic" class="w-3 h-3 text-rose-600"></i>
                      <span>${evt.audios.length} audio${evt.audios.length > 1 ? 's' : ''}</span>
                    </span>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
          ${dayEvents.length === 0 ? `
            <div class="text-center py-6 text-gray-300 text-xs">
              Sin eventos
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// --- DAY DETAIL MODAL ---
function handleDayClick(dateStr) {
  state.selectedDayDate = dateStr;
  renderCalendar(); // re-highlights date
  openDayDetailModal(dateStr);
}

function openDayDetailModal(dateStr) {
  const p = parseDateString(dateStr);
  const cfg = getActiveSeasonConfig();
  const events = state.events.filter(e => e.date === dateStr);

  document.getElementById('dayModalDateTitle').textContent = `${p.day} de ${MONTH_NAMES_ES[p.monthIndex]}, ${p.year}`;
  document.getElementById('dayModalEventsCount').textContent = `${events.length} evento${events.length === 1 ? '' : 's'} registrado${events.length === 1 ? '' : 's'}`;

  // Header icon bg
  document.getElementById('dayModalIconBg').style.backgroundColor = cfg.primaryColor;

  // Photos for this day
  const allImages = [];
  events.forEach(e => {
    (e.images || []).forEach(img => {
      allImages.push({ url: img, caption: e.title });
    });
  });

  const photosSection = document.getElementById('dayPhotosSection');
  const photosGrid = document.getElementById('dayPhotosGrid');
  if (allImages.length > 0) {
    photosSection.classList.remove('hidden');
    photosGrid.innerHTML = allImages.map(img => `
      <div 
        class="aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
        onclick="handleOpenLightbox('${img.url}', '${escapeHtml(img.caption)}')"
      >
        <img src="${img.url}" class="w-full h-full object-cover" />
      </div>
    `).join('');
  } else {
    photosSection.classList.add('hidden');
    photosGrid.innerHTML = '';
  }

  // Events list
  const eventsList = document.getElementById('dayEventsList');
  const emptyState = document.getElementById('dayEmptyState');

  if (events.length > 0) {
    emptyState.classList.add('hidden');
    eventsList.innerHTML = events.map(evt => {
      return `
        <div class="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="text-sm font-bold font-serif text-gray-900">${escapeHtml(evt.title)}</h3>
              ${evt.location ? `
                <div class="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-700"></i>
                  <span>${escapeHtml(evt.location)}</span>
                </div>
              ` : ''}
            </div>

            <!-- Action buttons: Edit and Inline Safe Delete -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button 
                onclick="handleEditEvent('${evt.id}')"
                class="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                title="Editar evento"
              >
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              </button>

              <div id="dayDeleteBox_${evt.id}">
                <button 
                  onclick="showDayInlineDelete('${evt.id}')"
                  class="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 transition-colors"
                  title="Eliminar evento"
                >
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>

          ${evt.description ? `
            <p class="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg whitespace-pre-wrap">${escapeHtml(evt.description)}</p>
          ` : ''}

          <!-- Audios List & Mini Players -->
          ${evt.audios && evt.audios.length > 0 ? `
            <div class="space-y-1.5 pt-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <i data-lucide="music" class="w-3 h-3"></i>
                <span>Audios adjuntos (${evt.audios.length})</span>
              </span>
              ${evt.audios.map((a, idx) => `
                <div class="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                  <button 
                    onclick="toggleMiniAudioPlayer('${evt.id}_${idx}', '${a.url}')"
                    id="audioBtn_${evt.id}_${idx}"
                    class="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0 hover:bg-amber-800 transition-colors cursor-pointer"
                  >
                    <i data-lucide="play" class="w-3.5 h-3.5 fill-current ml-0.5"></i>
                  </button>
                  <span class="font-medium truncate flex-1 text-gray-800">${escapeHtml(a.name || 'Nota de audio')}</span>
                  <audio id="audioEl_${evt.id}_${idx}" src="${a.url}" onended="resetMiniAudioPlayer('${evt.id}_${idx}')"></audio>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  } else {
    emptyState.classList.remove('hidden');
    eventsList.innerHTML = '';
  }

  // Footer add button handler
  document.getElementById('btnAddEventToThisDay').onclick = () => {
    closeDayDetailModal();
    handleOpenNewEventModal(dateStr);
  };

  document.getElementById('dayDetailModal').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeDayDetailModal() {
  document.getElementById('dayDetailModal').classList.add('hidden');
}

// Inline delete within Day Detail Modal
window.showDayInlineDelete = function(eventId) {
  const box = document.getElementById(`dayDeleteBox_${eventId}`);
  if (!box) return;
  box.innerHTML = `
    <div class="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-xs">
      <span class="text-[11px] font-semibold text-rose-800">¿Eliminar?</span>
      <button 
        onclick="executeDeleteEvent('${eventId}')"
        class="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700"
      >
        Sí
      </button>
      <button 
        onclick="openDayDetailModal('${state.selectedDayDate}')"
        class="px-1.5 py-0.5 bg-white border border-gray-300 text-gray-700 rounded text-[11px]"
      >
        No
      </button>
    </div>
  `;
};

// Mini audio player helper
window.toggleMiniAudioPlayer = function(id, url) {
  const audio = document.getElementById(`audioEl_${id}`);
  const btn = document.getElementById(`audioBtn_${id}`);
  if (!audio || !btn) return;

  if (audio.paused) {
    // pause other audios first
    document.querySelectorAll('audio').forEach(a => {
      if (a !== audio) {
        a.pause();
        a.currentTime = 0;
      }
    });
    audio.play();
    btn.innerHTML = `<i data-lucide="pause" class="w-3.5 h-3.5 fill-current"></i>`;
  } else {
    audio.pause();
    btn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-current ml-0.5"></i>`;
  }
  if (window.lucide) window.lucide.createIcons();
};

window.resetMiniAudioPlayer = function(id) {
  const btn = document.getElementById(`audioBtn_${id}`);
  if (btn) {
    btn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-current ml-0.5"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }
};

// --- EVENT MODAL (CREATE / EDIT) ---
function handleOpenNewEventModal(targetDate) {
  state.editingEventId = null;
  state.modalImages = [];
  state.modalAudios = [];

  const cfg = getActiveSeasonConfig();
  document.getElementById('eventModalTitle').textContent = 'Nuevo Evento';
  document.getElementById('eventModalHeader').style.backgroundColor = cfg.headerBgHex;
  document.getElementById('eventModalIconBg').style.backgroundColor = cfg.primaryColor;
  document.getElementById('btnSaveEvent').style.backgroundColor = cfg.primaryColor;

  document.getElementById('eventId').value = '';
  document.getElementById('eventTitleInput').value = '';
  document.getElementById('eventDateInput').value = targetDate || state.selectedDayDate || '2026-09-01';
  document.getElementById('eventLocationInput').value = '';
  document.getElementById('eventDescInput').value = '';

  document.getElementById('btnDeleteEvent').classList.add('hidden');
  document.getElementById('deleteConfirmBox').classList.add('hidden');

  renderModalImages();
  renderModalAudios();

  document.getElementById('eventModal').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function handleEditEvent(eventId) {
  const evt = state.events.find(e => e.id === eventId);
  if (!evt) return;

  closeDayDetailModal();

  state.editingEventId = eventId;
  state.modalImages = [...(evt.images || [])];
  state.modalAudios = [...(evt.audios || [])];

  const cfg = getActiveSeasonConfig();
  document.getElementById('eventModalTitle').textContent = 'Editar Evento';
  document.getElementById('eventModalHeader').style.backgroundColor = cfg.headerBgHex;
  document.getElementById('eventModalIconBg').style.backgroundColor = cfg.primaryColor;
  document.getElementById('btnSaveEvent').style.backgroundColor = cfg.primaryColor;

  document.getElementById('eventId').value = evt.id;
  document.getElementById('eventTitleInput').value = evt.title || '';
  document.getElementById('eventDateInput').value = evt.date || '';
  document.getElementById('eventLocationInput').value = evt.location || '';
  document.getElementById('eventDescInput').value = evt.description || '';

  // Show delete button
  document.getElementById('btnDeleteEvent').classList.remove('hidden');
  document.getElementById('btnDeleteEvent').classList.add('inline-flex');
  document.getElementById('deleteConfirmBox').classList.add('hidden');

  renderModalImages();
  renderModalAudios();

  document.getElementById('eventModal').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeEventModal() {
  document.getElementById('eventModal').classList.add('hidden');
  stopRecording(false);
}

// Render uploaded images in Event Modal
function renderModalImages() {
  const container = document.getElementById('eventImagesPreview');
  if (state.modalImages.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = state.modalImages.map((img, idx) => `
    <div class="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 group">
      <img src="${img}" class="w-full h-full object-cover" />
      <button 
        type="button"
        onclick="removeModalImage(${idx})"
        class="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
        title="Quitar foto"
      >
        <i data-lucide="x" class="w-3 h-3"></i>
      </button>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

window.removeModalImage = function(index) {
  state.modalImages.splice(index, 1);
  renderModalImages();
};

// Render uploaded audios in Event Modal
function renderModalAudios() {
  const container = document.getElementById('eventAudiosList');
  if (state.modalAudios.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = state.modalAudios.map((aud, idx) => `
    <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs">
      <div class="flex items-center gap-2 truncate">
        <i data-lucide="music" class="w-4 h-4 text-blue-600 shrink-0"></i>
        <span class="font-medium truncate text-gray-800">${escapeHtml(aud.name)}</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <audio controls class="h-6 w-32 sm:w-44" src="${aud.url}"></audio>
        <button 
          type="button"
          onclick="removeModalAudio(${idx})"
          class="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
          title="Eliminar audio"
        >
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

window.removeModalAudio = function(index) {
  state.modalAudios.splice(index, 1);
  renderModalAudios();
};

// Image Upload Handler
document.getElementById('eventImageUpload').addEventListener('change', function(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      state.modalImages.push(loadEvt.target.result);
      renderModalImages();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

// Audio Upload Handler
document.getElementById('eventAudioUpload').addEventListener('change', function(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      state.modalAudios.push({
        id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: file.name,
        url: loadEvt.target.result
      });
      renderModalAudios();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

// Audio Recording with MediaRecorder API
document.getElementById('btnRecordVoice').addEventListener('click', function() {
  if (state.isRecording) {
    stopRecording(true);
  } else {
    startRecording();
  }
});

document.getElementById('btnStopRecord').addEventListener('click', function() {
  stopRecording(true);
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.mediaRecorder = new MediaRecorder(stream);
    state.audioChunks = [];

    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    };

    state.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const audioUrl = reader.result;
        state.modalAudios.push({
          id: 'rec_' + Date.now(),
          name: `Grabación de voz (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
          url: audioUrl
        });
        renderModalAudios();
      };
      reader.readAsDataURL(audioBlob);

      // Stop mic tracks
      stream.getTracks().forEach(t => t.stop());
    };

    state.mediaRecorder.start();
    state.isRecording = true;
    state.recordSeconds = 0;

    document.getElementById('recordingIndicator').classList.remove('hidden');
    document.getElementById('recordingIndicator').classList.add('flex');
    document.getElementById('recordVoiceText').textContent = 'Grabando...';

    state.recordInterval = setInterval(() => {
      state.recordSeconds++;
      const m = String(Math.floor(state.recordSeconds / 60)).padStart(2, '0');
      const s = String(state.recordSeconds % 60).padStart(2, '0');
      document.getElementById('recordingTimer').textContent = `${m}:${s}`;
    }, 1000);
  } catch (err) {
    console.error('Error al acceder al micrófono:', err);
    // Inline friendly notice
    alert('No se pudo acceder al micrófono. Por favor asegúrate de otorgar permisos en tu navegador.');
  }
}

function stopRecording(save) {
  if (!state.isRecording) return;
  state.isRecording = false;
  clearInterval(state.recordInterval);

  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
  }

  document.getElementById('recordingIndicator').classList.add('hidden');
  document.getElementById('recordingIndicator').classList.remove('flex');
  document.getElementById('recordVoiceText').textContent = 'Grabar nota';
}

// Delete Event Confirm Flow (Zero window.confirm)
document.getElementById('btnDeleteEvent').addEventListener('click', function() {
  this.classList.add('hidden');
  this.classList.remove('inline-flex');
  document.getElementById('deleteConfirmBox').classList.remove('hidden');
  document.getElementById('deleteConfirmBox').classList.add('flex');
});

document.getElementById('btnConfirmDeleteNo').addEventListener('click', function() {
  document.getElementById('deleteConfirmBox').classList.add('hidden');
  document.getElementById('deleteConfirmBox').classList.remove('flex');
  document.getElementById('btnDeleteEvent').classList.remove('hidden');
  document.getElementById('btnDeleteEvent').classList.add('inline-flex');
});

document.getElementById('btnConfirmDeleteYes').addEventListener('click', function() {
  if (state.editingEventId) {
    executeDeleteEvent(state.editingEventId);
  }
  closeEventModal();
});

function executeDeleteEvent(id) {
  state.events = state.events.filter(e => e.id !== id);
  saveEventsToStorage();
  renderCalendar();
  if (!document.getElementById('dayDetailModal').classList.contains('hidden')) {
    openDayDetailModal(state.selectedDayDate);
  }
}

// Save Event Submit
document.getElementById('eventForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const title = document.getElementById('eventTitleInput').value.trim();
  const date = document.getElementById('eventDateInput').value;
  const location = document.getElementById('eventLocationInput').value.trim();
  const description = document.getElementById('eventDescInput').value.trim();

  if (!title || !date) return;

  const eventData = {
    id: state.editingEventId || ('evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
    title,
    date,
    location,
    description,
    images: state.modalImages,
    audios: state.modalAudios,
    createdAt: Date.now()
  };

  if (state.editingEventId) {
    state.events = state.events.map(e => e.id === state.editingEventId ? eventData : e);
  } else {
    state.events.unshift(eventData);
  }

  saveEventsToStorage();
  closeEventModal();
  state.selectedDayDate = date;
  renderCalendar();
});

// --- LIGHTBOX ---
function handleOpenLightbox(url, caption) {
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightboxCaption').textContent = caption || '';
  document.getElementById('imageLightbox').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeLightbox() {
  document.getElementById('imageLightbox').classList.add('hidden');
}

// --- AMBIENT SYNTHESIZER MUSIC PLAYER (Web Audio API) ---
class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.5;
    this.timer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play() {
    this.init();
    this.isPlaying = true;
    this.scheduleNotes();
    this.updateVisualizer(true);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    this.updateVisualizer(false);
  }

  toggle() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  setVolume(v) {
    this.volume = v;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  updateVisualizer(active) {
    const bars = document.querySelectorAll('.visualizer-bar');
    bars.forEach(b => {
      if (active) b.classList.add('active');
      else b.classList.remove('active');
    });
  }

  // Genera acordes relajantes y cálidos pentatónicos según la estación
  scheduleNotes() {
    if (!this.isPlaying || !this.ctx) return;

    // Frecuencias pentatónicas relajantes (C major / A minor pentatonic / D dorian)
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C - E - G - C
      [220.00, 261.63, 329.63, 440.00], // A - C - E - A
      [174.61, 220.00, 261.63, 349.23], // F - A - C - F
      [196.00, 246.94, 293.66, 392.00]  // G - B - D - G
    ];

    const chord = chords[Math.floor(Math.random() * chords.length)];
    const note = chord[Math.floor(Math.random() * chord.length)];

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, now);

    // Warm envelope
    const curVol = this.isMuted ? 0 : this.volume * 0.15;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(curVol, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 3.6);

    const nextDelay = 1200 + Math.random() * 1800;
    this.timer = setTimeout(() => this.scheduleNotes(), nextDelay);
  }
}

const audioEngine = new AmbientAudioEngine();

// --- SEASONAL PARTICLES (CANVAS) ---
function initSeasonalParticles() {
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const PARTICLE_COUNT = 30;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 4 + Math.random() * 8,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: 0.5 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
      opacity: 0.3 + Math.random() * 0.5
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const cfg = getActiveSeasonConfig();
    const type = cfg.particleType;

    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (type === 'leaf') {
        // Otoño: Hojas terracota y ámbar
        ctx.fillStyle = cfg.primaryColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'petal') {
        // Primavera: Pétalos rosados
        ctx.fillStyle = '#E284A5';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'sun') {
        // Verano: Destellos dorados
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Invierno: Copos de nieve suaves
        ctx.fillStyle = '#93C5FD';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      else if (p.x < -20) p.x = width + 20;
    });

    animationFrameId = requestAnimationFrame(draw);
  }

  draw();
}

// Helper to escape HTML strings safely
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- POPULATE MONTH & YEAR SELECTORS ---
function populateSelectors() {
  const selMonth = document.getElementById('selectMonth');
  const selYear = document.getElementById('selectYear');

  selMonth.innerHTML = MONTH_NAMES_ES.map((m, idx) => `
    <option value="${idx}">${m}</option>
  `).join('');

  const years = [2025, 2026, 2027, 2028];
  selYear.innerHTML = years.map(y => `
    <option value="${y}">${y}</option>
  `).join('');

  selMonth.addEventListener('change', (e) => {
    state.currentMonthIndex = parseInt(e.target.value, 10);
    renderCalendar();
  });

  selYear.addEventListener('change', (e) => {
    state.currentYear = parseInt(e.target.value, 10);
    renderCalendar();
  });
}

// --- ATTACH GLOBAL EVENT LISTENERS ---
function attachEventListeners() {
  // Navigation Month Prev / Next
  document.getElementById('btnPrevMonth').addEventListener('click', () => {
    if (state.currentMonthIndex === 0) {
      state.currentYear--;
      state.currentMonthIndex = 11;
    } else {
      state.currentMonthIndex--;
    }
    renderCalendar();
  });

  document.getElementById('btnNextMonth').addEventListener('click', () => {
    if (state.currentMonthIndex === 11) {
      state.currentYear++;
      state.currentMonthIndex = 0;
    } else {
      state.currentMonthIndex++;
    }
    renderCalendar();
  });

  // Jump to September 2026
  const jumpSeptAction = () => {
    state.currentYear = 2026;
    state.currentMonthIndex = 8;
    state.selectedDayDate = '2026-09-01';
    renderCalendar();
  };
  document.getElementById('btnJumpSept').addEventListener('click', jumpSeptAction);
  document.getElementById('btnFooterSept').addEventListener('click', jumpSeptAction);

  // Jump to 14 Feb 2027 from Countdown
  document.getElementById('btnJumpValentine').addEventListener('click', () => {
    state.currentYear = 2027;
    state.currentMonthIndex = 1; // Febrero
    state.selectedDayDate = '2027-02-14';
    renderCalendar();
  });

  // View switchers
  document.getElementById('btnViewMes').addEventListener('click', () => {
    state.viewMode = 'mes';
    renderCalendar();
  });

  document.getElementById('btnViewSemana').addEventListener('click', () => {
    state.viewMode = 'semana';
    renderCalendar();
  });

  // New Event Button
  document.getElementById('btnNewEvent').addEventListener('click', () => {
    handleOpenNewEventModal();
  });

  // Search input
  const inputSearch = document.getElementById('inputSearch');
  const btnClearSearch = document.getElementById('btnClearSearch');

  inputSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery) btnClearSearch.classList.remove('hidden');
    else btnClearSearch.classList.add('hidden');
    renderCalendar();
  });

  btnClearSearch.addEventListener('click', () => {
    inputSearch.value = '';
    state.searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderCalendar();
  });

  // Modals Close Buttons
  document.getElementById('btnCloseEventModal').addEventListener('click', closeEventModal);
  document.getElementById('btnCancelEventModal').addEventListener('click', closeEventModal);

  document.getElementById('btnCloseDayModal').addEventListener('click', closeDayDetailModal);
  document.getElementById('btnCloseDayModalFooter').addEventListener('click', closeDayDetailModal);

  document.getElementById('btnCloseLightbox').addEventListener('click', closeLightbox);

  // Click outside to close modals
  window.addEventListener('click', (e) => {
    if (e.target.id === 'eventModal') closeEventModal();
    if (e.target.id === 'dayDetailModal') closeDayDetailModal();
    if (e.target.id === 'imageLightbox') closeLightbox();
  });

  // ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEventModal();
      closeDayDetailModal();
      closeLightbox();
    }
  });

  // Music Player Toggle
  const btnToggleMusic = document.getElementById('btnToggleMusic');
  btnToggleMusic.addEventListener('click', () => {
    audioEngine.toggle();
    const playIcon = document.getElementById('musicPlayIcon');
    const playText = document.getElementById('musicPlayText');

    if (audioEngine.isPlaying) {
      playIcon.setAttribute('data-lucide', 'pause');
      playText.textContent = 'Pausar';
    } else {
      playIcon.setAttribute('data-lucide', 'play');
      playText.textContent = 'Reproducir';
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // Mute Music
  document.getElementById('btnMuteMusic').addEventListener('click', () => {
    const isMuted = audioEngine.toggleMute();
    const muteIcon = document.getElementById('musicMuteIcon');
    if (isMuted) {
      muteIcon.setAttribute('data-lucide', 'volume-x');
    } else {
      muteIcon.setAttribute('data-lucide', 'volume-2');
    }
    if (window.lucide) window.lucide.createIcons();
  });

  // Volume range
  document.getElementById('musicVolume').addEventListener('input', (e) => {
    audioEngine.setVolume(parseFloat(e.target.value));
  });
}

// Week Navigation Handlers
window.handlePrevWeek = function() {
  const p = parseDateString(state.selectedDayDate);
  const cur = new Date(p.year, p.monthIndex, p.day - 7);
  state.selectedDayDate = formatDateString(cur.getFullYear(), cur.getMonth(), cur.getDate());
  state.currentYear = cur.getFullYear();
  state.currentMonthIndex = cur.getMonth();
  renderCalendar();
};

window.handleNextWeek = function() {
  const p = parseDateString(state.selectedDayDate);
  const cur = new Date(p.year, p.monthIndex, p.day + 7);
  state.selectedDayDate = formatDateString(cur.getFullYear(), cur.getMonth(), cur.getDate());
  state.currentYear = cur.getFullYear();
  state.currentMonthIndex = cur.getMonth();
  renderCalendar();
};

// Global Exposure for inline HTML events
window.handleDayClick = handleDayClick;
window.handleOpenNewEventModal = handleOpenNewEventModal;
window.handleEditEvent = handleEditEvent;
window.handleOpenLightbox = handleOpenLightbox;

// --- DOM READY INIT ---
document.addEventListener('DOMContentLoaded', () => {
  loadEventsFromStorage();
  populateSelectors();
  attachEventListeners();
  initCountdown();
  initSeasonalParticles();
  renderCalendar();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});
