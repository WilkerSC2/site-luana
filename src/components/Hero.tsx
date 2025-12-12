import React from 'react';
import { ChevronDown } from 'lucide-react';
import TypingEffect from './TypingEffect';

const Hero = () => {
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
      style={{
        backgroundImage:
          "linear-gradient(rgba(60, 26, 123, 0.4), rgba(0, 0, 0, 0.5)), url('https://g5vcbby14l69mxgk.public.blob.vercel-storage.com/Fotos_Ibira/TesteLuana.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center top 45%",
        backgroundRepeat: "no-repeat",
        width: "100%",
        minHeight: "100vh"
      }}
    >
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