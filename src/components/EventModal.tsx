import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  AlignLeft, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Music,
  Mic,
  Volume2
} from 'lucide-react';
import { CalendarEvent } from '../types/calendar';
import { SeasonConfig } from '../types/season';
import { AudioPlayerMini } from './AudioPlayerMini';

interface AudioItem {
  id: string;
  name: string;
  url: string;
  size?: string;
  duration?: number;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  initialEvent?: CalendarEvent | null;
  defaultDate?: string;
  seasonConfig: SeasonConfig;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  defaultDate,
  seasonConfig,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || '2026-09-01');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  // Audio files state
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Inline delete confirmation state (safe in iframe environments)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setDescription(initialEvent.description || '');
      setLocation(initialEvent.location || '');
      setImages(initialEvent.images || []);
      setAudios(initialEvent.audios || []);
    } else {
      setTitle('');
      setDate(defaultDate || '2026-09-01');
      setDescription('');
      setLocation('');
      setImages([]);
      setAudios([]);
    }
    setImageUrlInput('');
    setShowUrlField(false);
    setIsRecording(false);
    setIsConfirmingDelete(false);
  }, [initialEvent, defaultDate, isOpen]);

  if (!isOpen) return null;

  // Handle user's image upload from device (converts to base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      setShowUrlField(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('audio/')) return;

      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setAudios((prev) => [
            ...prev,
            {
              id: `audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              url: result,
              size: sizeStr,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (audioFileInputRef.current) {
      audioFileInputRef.current.value = '';
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const sizeKb = Math.round(audioBlob.size / 1024);
          setAudios((prev) => [
            ...prev,
            {
              id: `rec-${Date.now()}`,
              name: `Nota de Voz - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              url: base64Audio,
              size: `${sizeKb} KB`,
            },
          ]);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      alert('No se pudo acceder al micrófono. Por favor permite los permisos o sube un archivo de audio directamente.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRemoveAudio = (idToRemove: string) => {
    setAudios((prev) => prev.filter((a) => a.id !== idToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData: CalendarEvent = {
      id: initialEvent ? initialEvent.id : `evt-${Date.now()}`,
      title: title.trim(),
      date,
      description: description.trim(),
      location: location.trim(),
      images,
      audios,
      createdAt: initialEvent ? initialEvent.createdAt : Date.now(),
    };

    onSave(eventData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div 
        className="rounded-2xl border shadow-xl w-full max-w-lg my-8 overflow-hidden transition-colors"
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
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg text-white flex items-center justify-center transition-colors"
              style={{ backgroundColor: seasonConfig.primaryColor }}
            >
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 
                className="font-serif text-lg font-bold transition-colors"
                style={{ color: seasonConfig.textColor }}
              >
                {initialEvent ? 'Editar Evento' : 'Registrar Evento'}
              </h2>
              <p 
                className="text-xs transition-colors"
                style={{ color: seasonConfig.mutedTextColor }}
              >
                Ingresa los datos del evento y adjunta tus imágenes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: seasonConfig.mutedTextColor }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6D5344] mb-1">
              Título del Evento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Caminata por el bosque, Cena familiar..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#DFCFC1] rounded-xl text-sm text-[#382417] placeholder-[#A08878] focus:outline-none focus:ring-2 focus:ring-[#A8421E]/30 focus:border-[#A8421E]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6D5344] mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#DFCFC1] rounded-xl text-xs sm:text-sm text-[#382417] focus:outline-none focus:ring-2 focus:ring-[#A8421E]/30 focus:border-[#A8421E]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6D5344] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#A8421E]" />
              <span>Lugar o Ubicación (opcional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Parque, Cabaña, Casa..."
              className="w-full px-3.5 py-2 bg-white border border-[#DFCFC1] rounded-xl text-xs sm:text-sm text-[#382417] placeholder-[#A08878] focus:outline-none focus:ring-2 focus:ring-[#A8421E]/30 focus:border-[#A8421E]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6D5344] mb-1">
              <AlignLeft className="w-3.5 h-3.5 text-[#A8421E]" />
              <span>Descripción / Notas (opcional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles, recuerdos o notas sobre el evento..."
              className="w-full px-3.5 py-2 bg-white border border-[#DFCFC1] rounded-xl text-xs sm:text-sm text-[#382417] placeholder-[#A08878] focus:outline-none focus:ring-2 focus:ring-[#A8421E]/30 focus:border-[#A8421E]"
            />
          </div>

          {/* Images Section */}
          <div className="pt-2 border-t border-[#E8DCCF]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6D5344]">
                <ImageIcon className="w-3.5 h-3.5 text-[#A8421E]" />
                <span>Imágenes Adjuntas ({images.length})</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#A8421E] text-white hover:bg-[#8F3516] rounded-lg transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#EFE3D5] text-[#5A4032] hover:bg-[#E5D5C4] rounded-lg transition-colors"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* URL input field if toggled */}
            {showUrlField && (
              <div 
                className="flex items-center gap-2 mb-3 p-2 rounded-xl transition-colors"
                style={{ backgroundColor: seasonConfig.primaryLight }}
              >
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border rounded-md focus:outline-none transition-colors"
                  style={{
                    borderColor: seasonConfig.borderStrongHex,
                    color: seasonConfig.textColor,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  className="px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors"
                  style={{ backgroundColor: seasonConfig.primaryColor }}
                >
                  Añadir
                </button>
              </div>
            )}

            {/* Attached user images preview list */}
            {images.length === 0 ? (
              <p 
                className="text-xs italic py-2 transition-colors"
                style={{ color: seasonConfig.mutedTextColor }}
              >
                Puedes subir fotos desde tu dispositivo para acompañar este evento.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden aspect-square border bg-black/5"
                    style={{ borderColor: seasonConfig.borderStrongHex }}
                  >
                    <img
                      src={imgUrl}
                      alt="Adjunta"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                      title="Eliminar foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audio Section: Upload & Voice Note */}
          <div 
            className="pt-3 border-t transition-colors"
            style={{ borderColor: seasonConfig.borderHex }}
          >
            <div className="flex items-center justify-between mb-2">
              <label 
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                style={{ color: seasonConfig.textColor }}
              >
                <Music className="w-3.5 h-3.5" style={{ color: seasonConfig.primaryColor }} />
                <span>Audios Adjuntos ({audios.length})</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-2xs transition-all active:scale-95"
                  style={{ backgroundColor: seasonConfig.primaryColor }}
                  title="Subir archivo de audio (MP3, WAV, M4A, OGG...)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Audio</span>
                </button>

                <button
                  type="button"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isRecording 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'border hover:bg-black/5'
                  }`}
                  style={{
                    borderColor: isRecording ? 'transparent' : seasonConfig.borderStrongHex,
                    color: isRecording ? '#FFFFFF' : seasonConfig.textColor,
                  }}
                  title={isRecording ? 'Detener grabación de voz' : 'Grabar nota de voz con micrófono'}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isRecording ? 'Detener' : 'Grabar'}</span>
                </button>
              </div>
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 p-2.5 mb-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span className="font-semibold">Grabando audio desde tu micrófono...</span>
                <span className="text-[11px] opacity-80">(Haz clic en «Detener» cuando finalices)</span>
              </div>
            )}

            {/* List of uploaded audios with built-in player */}
            {audios.length === 0 ? (
              <p 
                className="text-xs italic py-2 transition-colors"
                style={{ color: seasonConfig.mutedTextColor }}
              >
                Puedes subir archivos de audio (canciones, dedicatorias, notas de voz) o grabarlas en vivo.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {audios.map((audio) => (
                  <AudioPlayerMini
                    key={audio.id}
                    audio={audio}
                    seasonConfig={seasonConfig}
                    onDelete={() => handleRemoveAudio(audio.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div 
            className="pt-4 border-t flex items-center justify-between gap-3 transition-colors"
            style={{ borderColor: seasonConfig.borderHex }}
          >
            {initialEvent && onDelete ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-semibold text-rose-800">¿Eliminar este evento?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(initialEvent.id);
                      setIsConfirmingDelete(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200/60 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Evento</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold hover:bg-black/5 rounded-xl transition-colors"
                style={{ color: seasonConfig.mutedTextColor }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all transform active:scale-95"
                style={{ backgroundColor: seasonConfig.primaryColor }}
              >
                {initialEvent ? 'Guardar Cambios' : 'Crear Evento'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
