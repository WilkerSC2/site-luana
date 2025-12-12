import React, { useState, useEffect } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { supabase } from '../lib/supabase';

interface BeforeAfterImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
}

const MuseuEditSection = () => {
  const [beforeImage, setBeforeImage] = useState<string>('');
  const [afterImage, setAfterImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('category', 'before-after')
      .order('order_index', { ascending: true })
      .limit(2);

    if (!error && data && data.length >= 2) {
      setBeforeImage(data[0].image_url);
      setAfterImage(data[1].image_url);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section id="museu-edit" className="py-12 bg-white dark:bg-[#140F1E] transition-colors duration-300">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </section>
    );
  }

  if (!beforeImage || !afterImage) {
    return null;
  }

  return (
    <section id="museu-edit" className="py-12 bg-white dark:bg-[#140F1E] transition-colors duration-300">
      <div className="w-full px-0">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-4 font-playfair">Edição Antes e Depois</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-playfair">
            Veja a diferença da edição na foto arrastando a régua abaixo.
          </p>
        </div>
        <BeforeAfterSlider
          beforeSrc={beforeImage}
          afterSrc={afterImage}
          beforeLabel="Antes"
          afterLabel="Depois"
        />
      </div>
    </section>
  );
};

export default MuseuEditSection;
