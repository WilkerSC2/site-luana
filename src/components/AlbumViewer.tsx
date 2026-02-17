import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OptimizedImage from './OptimizedImage';

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

const DESKTOP_PAGE_SIZE = 12;
const MOBILE_PAGE_SIZE = 6;

export default function AlbumViewer({ albumId, albumTitle, onClose }: AlbumViewerProps) {
  const latestAlbumIdRef = useRef(albumId);
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxDisplayLoaded, setLightboxDisplayLoaded] = useState(false);

  useEffect(() => {
    latestAlbumIdRef.current = albumId;
  }, [albumId]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mq = window.matchMedia('(max-width: 640px)');
    const apply = () => setPageSize(mq.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    apply();

    // Safari fallback
    const handler = () => apply();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(handler);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(handler);
  }, []);

  const loadFirstPage = useCallback(async () => {
    const albumIdAtCall = albumId;
    setLoading(true);
    setLoadingMore(false);
    setHasMore(false);
    setTotalCount(null);
    setPhotos([]);
    setCurrentIndex(0);
    setIsLightboxOpen(false);

    const { data, error, count } = await supabase
      .from('album_photos')
      .select('id,photo_url,order_index', { count: 'exact' })
      .eq('album_id', albumIdAtCall)
      .order('order_index', { ascending: true })
      .range(0, pageSize - 1);

    if (latestAlbumIdRef.current !== albumIdAtCall) return;

    if (!error && data) {
      setPhotos(data);
      setTotalCount(typeof count === 'number' ? count : null);
      setHasMore(typeof count === 'number' ? data.length < count : data.length === pageSize);
    }

    setLoading(false);
  }, [albumId, pageSize]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    const albumIdAtCall = albumId;
    setLoadingMore(true);

    const from = photos.length;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('album_photos')
      .select('id,photo_url,order_index')
      .eq('album_id', albumIdAtCall)
      .order('order_index', { ascending: true })
      .range(from, to);

    if (latestAlbumIdRef.current !== albumIdAtCall) return;

    if (!error && data && data.length > 0) {
      const next = [...photos, ...data];
      setPhotos(next);
      setHasMore(data.length === pageSize && (typeof totalCount === 'number' ? next.length < totalCount : true));
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [albumId, hasMore, loading, loadingMore, pageSize, photos, totalCount]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      if (e.key === 'ArrowRight') {
        if (currentIndex < photos.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else if (hasMore && !loadingMore) {
          void loadMore();
        }
      }
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasMore, isLightboxOpen, loadMore, loadingMore, photos.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    setLightboxDisplayLoaded(false);
  }, [currentIndex, isLightboxOpen]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    setLightboxDisplayLoaded(false);
  };

  const nextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (hasMore && !loadingMore) {
      void loadMore();
    }
  };

  const previousPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const counterTotal = typeof totalCount === 'number' ? totalCount : photos.length;

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
          <h1 className="text-4xl md:text-5xl font-playfair text-gray-900 dark:text-white mb-4">{albumTitle}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {typeof totalCount === 'number' ? (
              <>
                {photos.length} de {totalCount} {totalCount === 1 ? 'foto' : 'fotos'}
              </>
            ) : (
              <>
                {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando fotos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Nenhuma foto neste álbum.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(index)}
                  className="group relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 cursor-pointer shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-[3/4] w-full">
                    <OptimizedImage
                      src={photo.photo_url}
                      alt={`${albumTitle} - Foto ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      variant="thumb"
                      widths={[400, 800, 1200]}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-60"
                >
                  {loadingMore ? 'Carregando...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
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
                {currentIndex + 1} / {counterTotal}
              </span>
            </div>

            <div className="relative w-full max-w-[95vw] h-[80vh]">
              <OptimizedImage
                src={photos[currentIndex].photo_url}
                alt={`${albumTitle} - Foto ${currentIndex + 1}`}
                loading="eager"
                decoding="async"
                variant="thumb"
                widths={[600, 900, 1200]}
                sizes="100vw"
                quality={70}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                  lightboxDisplayLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <OptimizedImage
                src={photos[currentIndex].photo_url}
                alt={`${albumTitle} - Foto ${currentIndex + 1}`}
                loading="eager"
                decoding="async"
                preferRender
                variant="display"
                widths={[1200, 1600, 2000]}
                sizes="100vw"
                quality={85}
                // @ts-expect-error fetchPriority is supported in modern browsers but may not exist in older TS DOM typings
                fetchPriority="high"
                onLoad={() => setLightboxDisplayLoaded(true)}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                  lightboxDisplayLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

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

            {hasMore && currentIndex === photos.length - 1 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-60"
                >
                  {loadingMore ? 'Carregando...' : 'Carregar mais fotos'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
