import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Edit2, Trash2, Plus, Image as ImageIcon, Link } from 'lucide-react';
import { uploadImage } from '../lib/storage';

interface Album {
  id: string;
  title: string;
  cover_image_url: string;
  order_index: number;
}

interface AlbumPhoto {
  id: string;
  album_id: string;
  photo_url: string;
  order_index: number;
}

export default function AlbumsManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    cover_image_url: '',
  });
  const [photoForm, setPhotoForm] = useState({
    photo_url: '',
  });
  const [albumUploadMethod, setAlbumUploadMethod] = useState<'url' | 'file'>('url');
  const [photoUploadMethod, setPhotoUploadMethod] = useState<'url' | 'file'>('url');
  const [albumFile, setAlbumFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [draggedAlbumId, setDraggedAlbumId] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbumId) {
      loadPhotos(selectedAlbumId);
    }
  }, [selectedAlbumId]);

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

  const loadPhotos = async (albumId: string) => {
    const { data, error } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', albumId)
      .order('order_index', { ascending: true });

    if (!error && data) {
      setPhotos(data);
    }
  };

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = albumForm.cover_image_url;

      if (albumUploadMethod === 'file' && albumFile) {
        imageUrl = await uploadImage(albumFile, 'albums');
      }

      if (editingAlbum) {
        const { error } = await supabase
          .from('albums')
          .update({
            title: albumForm.title,
            cover_image_url: imageUrl,
          })
          .eq('id', editingAlbum.id);

        if (!error) {
          loadAlbums();
          setShowAlbumModal(false);
          setEditingAlbum(null);
          setAlbumForm({ title: '', cover_image_url: '' });
          setAlbumFile(null);
        }
      } else {
        const { error } = await supabase.from('albums').insert([
          {
            title: albumForm.title,
            cover_image_url: imageUrl,
            order_index: albums.length,
          },
        ]);

        if (!error) {
          loadAlbums();
          setShowAlbumModal(false);
          setAlbumForm({ title: '', cover_image_url: '' });
          setAlbumFile(null);
        }
      }
    } catch (error) {
      alert('Erro ao fazer upload da imagem');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    if (!selectedAlbumId) return;

    try {
      let imageUrl = photoForm.photo_url;

      if (photoUploadMethod === 'file' && photoFile) {
        imageUrl = await uploadImage(photoFile, 'photos');
      }

      const { error } = await supabase.from('album_photos').insert([
        {
          album_id: selectedAlbumId,
          photo_url: imageUrl,
          order_index: photos.length,
        },
      ]);

      if (!error) {
        loadPhotos(selectedAlbumId);
        setShowPhotoModal(false);
        setPhotoForm({ photo_url: '' });
        setPhotoFile(null);
      }
    } catch (error) {
      alert('Erro ao fazer upload da imagem');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este álbum? Todas as fotos do álbum serão removidas.')) {
      const { error } = await supabase.from('albums').delete().eq('id', id);

      if (!error) {
        loadAlbums();
        if (selectedAlbumId === id) {
          setSelectedAlbumId(null);
          setPhotos([]);
        }
      }
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta foto?')) {
      const { error } = await supabase.from('album_photos').delete().eq('id', id);

      if (!error && selectedAlbumId) {
        loadPhotos(selectedAlbumId);
      }
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setAlbumForm({
      title: album.title,
      cover_image_url: album.cover_image_url,
    });
    setShowAlbumModal(true);
  };

  const handlePhotoDragStart = (photoId: string) => {
    setDraggedPhotoId(photoId);
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePhotoDrop = async (targetPhotoId: string) => {
    if (!draggedPhotoId || draggedPhotoId === targetPhotoId) {
      setDraggedPhotoId(null);
      return;
    }

    const draggedIndex = photos.findIndex(p => p.id === draggedPhotoId);
    const targetIndex = photos.findIndex(p => p.id === targetPhotoId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPhotos = [...photos];
    const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, draggedPhoto);

    setPhotos(newPhotos);

    const updates = newPhotos.map((photo, index) =>
      supabase
        .from('album_photos')
        .update({ order_index: index })
        .eq('id', photo.id)
    );

    await Promise.all(updates);
    setDraggedPhotoId(null);
  };

  const handleAlbumDragStart = (albumId: string) => {
    setDraggedAlbumId(albumId);
  };

  const handleAlbumDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAlbumDrop = async (targetAlbumId: string) => {
    if (!draggedAlbumId || draggedAlbumId === targetAlbumId) {
      setDraggedAlbumId(null);
      return;
    }

    const draggedIndex = albums.findIndex(a => a.id === draggedAlbumId);
    const targetIndex = albums.findIndex(a => a.id === targetAlbumId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newAlbums = [...albums];
    const [draggedAlbum] = newAlbums.splice(draggedIndex, 1);
    newAlbums.splice(targetIndex, 0, draggedAlbum);

    setAlbums(newAlbums);

    const updates = newAlbums.map((album, index) =>
      supabase
        .from('albums')
        .update({ order_index: index })
        .eq('id', album.id)
    );

    await Promise.all(updates);
    setDraggedAlbumId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Álbuns e Coleções</h2>
        <button
          onClick={() => {
            setEditingAlbum(null);
            setAlbumForm({ title: '', cover_image_url: '' });
            setShowAlbumModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Criar Álbum
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Álbuns</h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
            </div>
          ) : albums.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum álbum criado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  draggable
                  onDragStart={() => handleAlbumDragStart(album.id)}
                  onDragOver={handleAlbumDragOver}
                  onDrop={() => handleAlbumDrop(album.id)}
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-move ${
                    selectedAlbumId === album.id ? 'ring-2 ring-purple-600' : ''
                  } ${draggedAlbumId === album.id ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedAlbumId(album.id)}
                >
                  <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-200">
                      <img
                        src={album.cover_image_url}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">{album.title}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAlbum(album);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAlbum(album.id);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        >
                          <Trash2 size={14} />
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedAlbumId ? `Fotos do Álbum (${photos.length})` : 'Selecione um álbum'}
            </h3>
            {selectedAlbumId && (
              <button
                onClick={() => setShowPhotoModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Adicionar Foto
              </button>
            )}
          </div>

          {selectedAlbumId ? (
            photos.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Nenhuma foto neste álbum</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => handlePhotoDragStart(photo.id)}
                    onDragOver={handlePhotoDragOver}
                    onDrop={() => handlePhotoDrop(photo.id)}
                    className={`bg-white rounded-lg shadow-md overflow-hidden group relative cursor-move ${
                      draggedPhotoId === photo.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="aspect-square bg-gray-200">
                      <img
                        src={photo.photo_url}
                        alt="Album photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <p className="text-gray-500">Selecione um álbum para ver as fotos</p>
            </div>
          )}
        </div>
      </div>

      {showAlbumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingAlbum ? 'Editar Álbum' : 'Criar Álbum'}
              </h3>
              <button
                onClick={() => {
                  setShowAlbumModal(false);
                  setEditingAlbum(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAlbumSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título do Álbum</label>
                <input
                  type="text"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome do álbum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem da Capa</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAlbumUploadMethod('url')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      albumUploadMethod === 'url'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Link size={18} />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlbumUploadMethod('file')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      albumUploadMethod === 'file'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Upload size={18} />
                    Arquivo
                  </button>
                </div>

                {albumUploadMethod === 'url' ? (
                  <input
                    type="url"
                    value={albumForm.cover_image_url}
                    onChange={(e) => setAlbumForm({ ...albumForm, cover_image_url: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://exemplo.com/capa.jpg"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAlbumFile(e.target.files?.[0] || null)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {albumFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Arquivo selecionado: {albumFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Enviando...' : editingAlbum ? 'Atualizar' : 'Criar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Adicionar Foto ao Álbum</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem da Foto</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPhotoUploadMethod('url')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      photoUploadMethod === 'url'
                        ? 'border-green-600 bg-green-50 text-green-600'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Link size={18} />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUploadMethod('file')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      photoUploadMethod === 'file'
                        ? 'border-green-600 bg-green-50 text-green-600'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Upload size={18} />
                    Arquivo
                  </button>
                </div>

                {photoUploadMethod === 'url' ? (
                  <input
                    type="url"
                    value={photoForm.photo_url}
                    onChange={(e) => setPhotoForm({ photo_url: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {photoFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Arquivo selecionado: {photoFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Enviando...' : 'Adicionar Foto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
