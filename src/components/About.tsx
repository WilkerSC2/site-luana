import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import OptimizedImage from './OptimizedImage';

const About = () => {
  const fallbackUrl = 'https://g5vcbby14l69mxgk.public.blob.vercel-storage.com/Fotos_Ibira/SobreMim.webp';
  const [aboutImageUrl, setAboutImageUrl] = useState<string>(fallbackUrl);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('image_url')
        .eq('category', 'about')
        .order('order_index', { ascending: false })
        .limit(1);

      if (cancelled) return;
      if (!error && data && data[0]?.image_url) {
        setAboutImageUrl(data[0].image_url);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-[#181622] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl">
              <OptimizedImage
                src={aboutImageUrl}
                alt="Sobre o fotógrafo"
                loading="lazy"
                decoding="async"
                variant="display"
                widths={[400, 800, 1200]}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-600 rounded-lg shadow-xl"></div>
          </div>

                    
          <div>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6 font-playfair">
              Sobre Mim
            </h2>
            <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-playfair">
              <p>
                Meu nome é Luana Leque sou estudante de Rádio e Tv.
                Sou apaixonada por cinema e em fazer vídeos e a fotografia é uma forma de expressar a minha criatividade e capturar momentos que, de outra forma, poderiam se perder no tempo.
              </p>
              <p>
                Através das lentes, conseguimos contar histórias, transmitir emoções e até explorar novos ângulos da realidade.
              </p>
            </div>

            {/* Stats */}
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
