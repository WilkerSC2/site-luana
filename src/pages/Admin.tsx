import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Upload, X, Edit2, Trash2, Link } from 'lucide-react';
import AlbumsManager from '../components/AlbumsManager';
import { uploadImage } from '../lib/storage';

interface PortfolioImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  order_index: number;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'albums'>('portfolio');
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'portfolio',
  });
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      loadImages();
    }
  }, [user, navigate]);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setImages(data);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = uploadForm.image_url;

      if (uploadMethod === 'file' && imageFile) {
        imageUrl = await uploadImage(imageFile, 'portfolio');
      }

      if (editingImage) {
        const { error } = await supabase
          .from('portfolio_images')
          .update({
            title: uploadForm.title,
            description: uploadForm.description,
            image_url: imageUrl,
            category: uploadForm.category,
          })
          .eq('id', editingImage.id);

        if (!error) {
          loadImages();
          setShowUploadModal(false);
          setEditingImage(null);
          setUploadForm({ title: '', description: '', image_url: '', category: 'portfolio' });
          setImageFile(null);
        }
      } else {
        const { error } = await supabase.from('portfolio_images').insert([
          {
            title: uploadForm.title,
            description: uploadForm.description,
            image_url: imageUrl,
            category: uploadForm.category,
            order_index: images.length,
          },
        ]);

        if (!error) {
          loadImages();
          setShowUploadModal(false);
          setUploadForm({ title: '', description: '', image_url: '', category: 'portfolio' });
          setImageFile(null);
        }
      }
    } catch (error) {
      alert('Erro ao fazer upload da imagem');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta imagem?')) {
      const { error } = await supabase.from('portfolio_images').delete().eq('id', id);

      if (!error) {
        loadImages();
      }
    }
  };

  const handleEdit = (image: PortfolioImage) => {
    setEditingImage(image);
    setUploadForm({
      title: image.title,
      description: image.description || '',
      image_url: image.image_url,
      category: image.category,
    });
    setShowUploadModal(true);
  };

  const handleImageDragStart = (imageId: string) => {
    setDraggedImageId(imageId);
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImageDrop = async (targetImageId: string) => {
    if (!draggedImageId || draggedImageId === targetImageId) {
      setDraggedImageId(null);
      return;
    }

    const draggedIndex = images.findIndex(img => img.id === draggedImageId);
    const targetIndex = images.findIndex(img => img.id === targetImageId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    setImages(newImages);

    const updates = newImages.map((img, index) =>
      supabase
        .from('portfolio_images')
        .update({ order_index: index })
        .eq('id', img.id)
    );

    await Promise.all(updates);
    setDraggedImageId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Imagens do Portfólio
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'albums'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Álbuns e Coleções
            </button>
          </nav>
        </div>

        {activeTab === 'portfolio' ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Gerenciar Imagens do Portfólio</h2>
              <button
                onClick={() => {
                  setEditingImage(null);
                  setUploadForm({ title: '', description: '', image_url: '', category: 'portfolio' });
                  setShowUploadModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload size={20} />
                Adicionar Imagem
              </button>
            </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando imagens...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleImageDragStart(image.id)}
                onDragOver={handleImageDragOver}
                onDrop={() => handleImageDrop(image.id)}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-move ${
                  draggedImageId === image.id ? 'opacity-50' : ''
                }`}
              >
                <div className="aspect-video relative overflow-hidden bg-gray-200">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">{image.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{image.description || 'Sem descrição'}</p>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full mb-3">
                    {image.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">Nenhuma imagem adicionada ainda</p>
            <p className="text-gray-500 text-sm">Clique em "Adicionar Imagem" para começar</p>
          </div>
        )}
          </>
        ) : (
          <AlbumsManager />
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingImage ? 'Editar Imagem' : 'Adicionar Imagem'}
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setEditingImage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nome da imagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descrição opcional"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      uploadMethod === 'url'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Link size={18} />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                      uploadMethod === 'file'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Upload size={18} />
                    Arquivo
                  </button>
                </div>

                {uploadMethod === 'url' ? (
                  <input
                    type="url"
                    value={uploadForm.image_url}
                    onChange={(e) => setUploadForm({ ...uploadForm, image_url: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {imageFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Arquivo selecionado: {imageFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="portfolio">Portfolio</option>
                  <option value="before-after">Antes e Depois</option>
                  <option value="hero">Hero/Banner</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Enviando...' : editingImage ? 'Atualizar' : 'Adicionar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
