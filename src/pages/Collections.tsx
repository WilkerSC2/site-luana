import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AlbumViewer from '../components/AlbumViewer';

interface Album {
  id: string;
  title: string;
  cover_image_url: string;
  order_index: number;
}

export default function Collections() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setAlbums(data);
    }
    setLoading(false);
  };

  if (selectedAlbumId) {
    const selectedAlbum = albums.find(album => album.id === selectedAlbumId);
    return (
      <AlbumViewer
        albumId={selectedAlbumId}
        albumTitle={selectedAlbum?.title || ''}
        onClose={() => setSelectedAlbumId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0b14] transition-colors duration-300 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para Início
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair text-gray-900 dark:text-white mb-4">
            Coleções
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore meus álbuns de fotografia organizados por tema
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando coleções...</p>
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Nenhuma coleção disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className="group relative overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 cursor-pointer
                           shadow-xl ring-1 ring-black/5 dark:ring-white/10
                           transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <div className="aspect-[4/3] w-full">
                  <img
                    src={album.cover_image_url}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-semibold text-white drop-shadow-lg">
                    {album.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
