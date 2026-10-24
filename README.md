# 🇵🇪 Calendario Perú 2026 (Vanilla Web / GitHub Pages)

Una aplicación web moderna, interactiva y ligera construida **100% con HTML5, CSS3 y Vanilla JavaScript** (sin necesidad de React ni Vite para su despliegue).

Diseñada especialmente para desplegarse directamente en **GitHub Pages** mediante el flujo estático (`.github/workflows/static.yml`) sin requerir pasos de compilación ni dependencias complejas.

---

## ✨ Características Principales

- **Estaciones Automáticas de Perú (Hemisferio Sur)**:
  - 🌸 **Primavera**: Del 23 de septiembre al 21 de diciembre.
  - ☀️ **Verano**: Del 21 de diciembre al 20 de marzo.
  - 🍂 **Otoño**: Del 20 de marzo al 21 de junio.
  - ❄️ **Invierno**: Del 21 de junio al 23 de septiembre.
  - Adaptación automática de paletas de color, temática, títulos y partículas animadas en tiempo real.

- **Vistas del Calendario**:
  - **Vista Mes**: Cuadrícula mensual completa, navegación por meses/años, selector directo a septiembre de 2026, e indicadores visuales de eventos con fotos y audios.
  - **Vista Semana**: Planificación semanal detallada con navegación entre semanas y vista rápida de fotos y notas de voz.

- **Gestión Completa de Eventos**:
  - Crear, editar y eliminar eventos con título, fecha, ubicación y notas.
  - **Confirmación interactiva y segura para eliminar**: Cuadro en pantalla sin alertas bloqueantes ni popups de navegador.
  - **Carga de fotografías**: Selección múltiple de imágenes persistidas en `localStorage` con visor a pantalla completa (lightbox).
  - **Subida de archivos de audio**: Soporta MP3, WAV, OGG, M4A, WebM.
  - **Grabadora de notas de voz en directo**: Utiliza la API del micrófono del navegador (`MediaRecorder`) con contador de tiempo en vivo.
  - **Mini reproductores de audio** integrados para escuchar las grabaciones de inmediato.

- **Experiencia Sonora y Visual**:
  - **Música ambiental estacional**: Generador de acordes andinos y relajantes mediante la API de Audio Web nativa (`Web Audio API`), que funciona 100% offline y sin enlaces caídos.
  - **Lienzo de partículas (Canvas)**: Hojas otoñales, pétalos primaverales, destellos solares o copos invernales.
  - **Cuenta regresiva**: Contador en vivo hacia el 14 de Febrero de 2027 (Día del Amor y la Amistad).

---

## 🛠️ Tecnologías y Arquitectura

- **HTML5 Semántico**: Estructura pura y accesible.
- **CSS3 & Tailwind CSS**: Diseño responsivo y moderno.
- **Vanilla JavaScript (ES6+)**: Lógica de calendario, eventos, cálculo astronómico y gestión de estado.
- **Web Audio API & MediaRecorder API**: Grabación y síntesis de sonido ambiental sin librerías externas.
- **Lucide Icons**: Iconografía moderna.
- **GitHub Pages Actions**: Flujo estático optimizado en `.github/workflows/static.yml`.

---

## 🚀 Despliegue en GitHub Pages

Dado que esta versión es **completamente estática y sin dependencias de compilación**, el archivo `.github/workflows/static.yml` desplegará el contenido de la raíz directamente a GitHub Pages:

1. Sube los archivos a la rama `main`:
```bash
git add .
git commit -m "feat: Versión estática Vanilla JS para GitHub Pages"
git push origin main
```

2. En tu repositorio de GitHub:
   - Ve a **Settings** > **Pages**.
   - En **Build and deployment** > **Source**, selecciona **GitHub Actions**.
   - ¡Listo! El workflow `.github/workflows/static.yml` publicará tu calendario en cuestión de segundos.

---

## 💻 Ejecución Local

Puedes abrir el proyecto de cualquiera de estas formas:

### Opción 1: Abrir directamente en el navegador
Haz doble clic sobre el archivo `index.html` o ábrelo desde cualquier navegador web.

### Opción 2: Servidor local simple
Si cuentas con Python instalado:
```bash
python3 -m http.server 3000
```
O con Node / npx:
```bash
npx serve .
```

---

## 📁 Estructura de Archivos

```text
├── index.html                   # Página web principal (Vanilla HTML)
├── app.js                       # Lógica completa de la aplicación (Vanilla JS)
├── styles.css                   # Estilos y animaciones personalizadas
├── assets/                      # Galería de imágenes y recursos
│   └── images/
├── .github/
│   └── workflows/
│       └── static.yml           # Flujo de despliegue automático a GitHub Pages
├── LICENSE                      # Licencia MIT
└── README.md                    # Documentación del proyecto
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).
