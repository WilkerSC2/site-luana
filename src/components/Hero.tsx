import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TypingEffect from './TypingEffect';
import { supabase } from '../lib/supabase';
import OptimizedImage from './OptimizedImage';

const Hero = () => {
  const fallbackUrl = 'https://edrijzuqbvvvxqnivkxb.supabase.co/storage/v1/object/public/portfolio-images/portfolio/1771361300100-hf5x3w.webp';
  const [heroImageUrl, setHeroImageUrl] = useState<string>(fallbackUrl);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('image_url')
        .eq('category', 'hero')
        .order('order_index', { ascending: false })
        .limit(1);

      if (cancelled) return;
      if (!error && data && data[0]?.image_url) {
        setHeroImageUrl(data[0].image_url);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <OptimizedImage
        src={heroImageUrl}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        variant="display"
        widths={[1200, 1600, 2000, 2400]}
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 45%' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#3c1a7b]/40 via-black/30 to-black/50" />
      <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-6">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light mb-6 leading-tight">
            <TypingEffect text={"Capturando"} speed={120} className="font-playfair" />
            <span className="block font-thin text-purple-300 drop-shadow-lg">
              <TypingEffect text={"Momentos"} speed={120} className="font-playfair" />
            </span>
            <TypingEffect text={"Eternos"} speed={120} className="font-playfair" />
          </h1>
          <p className="text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
            <span className="whitespace-nowrap max-w-full block">
              <TypingEffect text={"Cada imagem conta uma história, Cada projeto é uma obra de arte."} speed={40} className="font-playfair" />
            </span>
          </p>
          <button 
            onClick={scrollToPortfolio}
            className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-500 shadow-xl"
          >
            Ver Portfólio
          </button>
        </div>
      </div>
      <div 
        onClick={scrollToPortfolio}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
      >
        <ChevronDown className="text-white w-8 h-8 opacity-70" />
      </div>
    </section>
  );
};

export default Hero;
