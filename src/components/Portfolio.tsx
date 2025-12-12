import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface PortfolioImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  order_index: number;
}

const Portfolio = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('category', 'portfolio')
      .order('order_index', { ascending: true })
      .limit(6);

    if (!error && data) {
      setImages(data);
    }
    setLoading(false);
  };

  const filteredImages = images.map(img => ({
    id: img.id,
    src: img.image_url,
    category: img.category,
    title: img.title
  }));
  useEffect(() => {
    if (!selectedImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedIndex !== null && selectedIndex > 0) {
        const prevIndex = selectedIndex - 1;
  
        setSelectedIndex(prevIndex);
      }
      if (e.key === 'ArrowRight' && selectedIndex !== null && selectedIndex < filteredImages.length - 1) {
        const nextIndex = selectedIndex + 1;
        setSelectedImage(filteredImages[nextIndex].src);
        setSelectedIndex(nextIndex);
      }
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setSelectedIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedIndex, filteredImages]);

  return (
    <section id="portfolio" className="py-20 bg-gray-50 dark:bg-[#181622] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair text-gray-900 dark:text-white mb-4">Portfólio</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Uma seleção cuidadosa dos meus trabalhos mais marcantes
          </p>
        </div>


        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando imagens...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Nenhuma imagem disponível no momento.</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-8 xl:gap-12">
            {filteredImages.map((image) => (
            <div
              key={image.id}
              onClick={() => {
                setSelectedImage(image.src);
                setSelectedIndex(filteredImages.findIndex(img => img.src === image.src));
              }}
              className="group relative overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-700 cursor-pointer
                         shadow-xl ring-1 ring-black/5 dark:ring-white/10
                         transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-[0_22px_48px_-12px_rgba(147,51,234,0.55)]"
            >
              <div className="aspect-[3/4] w-full">
                <img
                  src={image.src}
                  className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-110"
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:shadow-[0_0_32px_8px_rgba(147,51,234,0.35)] group-hover:bg-purple-700/10 transition-all duration-300" />
              <div className="pointer-events-none absolute bottom-4 left-4 text-white text-lg font-semibold drop-shadow-lg">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </div>
            </div>
          ))}
          </div>
        )}

        {!loading && filteredImages.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
            >
              Ver Todas as Coleções
              <ArrowRight size={20} />
            </Link>
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="relative flex flex-col items-center justify-center w-full h-full">
              {/* Fechar */}
              <button
                onClick={() => { setSelectedImage(null); setSelectedIndex(null); }}
                className="absolute top-2 right-2 md:top-6 md:right-6 text-white hover:text-purple-400 transition-colors bg-black/60 rounded-full p-2 md:p-3 backdrop-blur-sm"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
                aria-label="Fechar"
              >
                <X size={28} className="md:w-10 md:h-10 w-7 h-7" />
              </button>
              <img src={selectedImage} alt="Portfolio Image" style={{ width: 'auto', height: 'auto', maxWidth: '100vw', maxHeight: '80vh' }} />
              {/* Setas abaixo da imagem no mobile, laterais no desktop */}
              <div className="flex w-full justify-center items-center mt-4 md:mt-0 md:absolute md:top-1/2 md:left-0 md:right-0 md:justify-between">
                {selectedIndex !== null && selectedIndex > 0 && (
                  <button
                    onClick={() => {
                      const prevIndex = selectedIndex - 1;
                      setSelectedImage(filteredImages[prevIndex].src);
                      setSelectedIndex(prevIndex);
                    }}
                    className="bg-black/60 text-white rounded-full p-2 md:p-3 hover:bg-purple-700/60 transition-colors z-50 mx-4 md:mx-0 md:fixed md:left-2 md:top-1/2 md:-translate-y-1/2"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft size={28} className="md:w-10 md:h-10 w-7 h-7" />
                  </button>
                )}
                {selectedIndex !== null && selectedIndex < filteredImages.length - 1 && (
                  <button
                    onClick={() => {
                      const nextIndex = selectedIndex + 1;
                      setSelectedImage(filteredImages[nextIndex].src);
                      setSelectedIndex(nextIndex);
                    }}
                    className="bg-black/60 text-white rounded-full p-2 md:p-3 hover:bg-purple-700 transition-colors z-50 mx-4 md:mx-0 md:fixed md:right-2 md:top-1/2 md:-translate-y-1/2"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight size={28} className="md:w-10 md:h-10 w-7 h-7" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;