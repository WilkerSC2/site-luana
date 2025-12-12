import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AlbumPhoto {
  id: string;
  photo_url: string;
  order_index: number;
}

interface AlbumViewerProps {
  albumId: string;
  albumTitle: string;
  onClose: () => void;
}

export default function AlbumViewer({ albumId, albumTitle, onClose }: AlbumViewerProps) {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [albumId]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentIndex, photos.length]);

  const loadPhotos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', albumId)
      .order('order_index', { ascending: true });

    if (!error && data) {
      setPhotos(data);
    }
    setLoading(false);
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const nextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0b14] transition-colors duration-300 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <button
          onClick={onClose}
          className="flex items-center gap-2 mb-8 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para Coleções
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair text-gray-900 dark:text-white mb-4">
            {albumTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando fotos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Nenhuma foto neste álbum.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(index)}
                className="group relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 cursor-pointer
                           shadow-lg ring-1 ring-black/5 dark:ring-white/10
                           transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[3/4] w-full">
                  <img
                    src={photo.photo_url}
                    alt={`${albumTitle} - Foto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {isLightboxOpen && photos[currentIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 md:top-6 md:right-6 text-white hover:text-purple-400 transition-colors bg-black/60 rounded-full p-2 md:p-3 backdrop-blur-sm z-50"
              aria-label="Fechar"
            >
              <X size={28} className="md:w-10 md:h-10 w-7 h-7" />
            </button>

            <div className="absolute top-2 left-2 md:top-6 md:left-6 text-white bg-black/60 rounded-lg px-4 py-2 backdrop-blur-sm">
              <span className="text-sm md:text-base">
                {currentIndex + 1} / {photos.length}
              </span>
            </div>

            <img
              src={photos[currentIndex].photo_url}
              alt={`${albumTitle} - Foto ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />

            <div className="flex w-full justify-center items-center mt-4 md:mt-0 md:absolute md:top-1/2 md:left-0 md:right-0 md:justify-between md:-translate-y-1/2">
              {currentIndex > 0 && (
                <button
                  onClick={previousPhoto}
                  className="bg-black/60 text-white rounded-full p-2 md:p-3 hover:bg-purple-700/60 transition-colors z-50 mx-4 md:mx-6"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={28} className="md:w-10 md:h-10 w-7 h-7" />
                </button>
              )}

              {currentIndex < photos.length - 1 && (
                <button
                  onClick={nextPhoto}
                  className="bg-black/60 text-white rounded-full p-2 md:p-3 hover:bg-purple-700/60 transition-colors z-50 mx-4 md:mx-6 md:ml-auto"
                  aria-label="Próxima foto"
                >
                  <ChevronRight size={28} className="md:w-10 md:h-10 w-7 h-7" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
