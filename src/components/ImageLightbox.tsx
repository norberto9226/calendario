import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  caption: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  caption,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `foto-otono-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center bg-[#241711] rounded-2xl overflow-hidden border border-[#523A2C] shadow-2xl"
      >
        {/* Top bar */}
        <div className="w-full px-4 py-3 bg-[#1C120D] border-b border-[#3B291F] flex items-center justify-between text-white">
          <span className="text-xs sm:text-sm font-medium text-[#E3D3C5] truncate max-w-md">
            {caption || 'Imagen del Evento'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-[#D4C0B0] hover:text-white hover:bg-[#38261C] transition-colors"
              title="Descargar imagen"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#D4C0B0] hover:text-white hover:bg-[#38261C] transition-colors"
              title="Cerrar vista"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image preview */}
        <div className="p-2 sm:p-4 flex items-center justify-center max-h-[80vh] overflow-hidden">
          <img
            src={imageUrl}
            alt={caption}
            referrerPolicy="no-referrer"
            className="max-h-[72vh] max-w-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
