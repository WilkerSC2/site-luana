import React, { useRef, useState, ChangeEvent } from 'react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeSrc, afterSrc, beforeLabel = 'Antes', afterLabel = 'Depois' }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Animação de scroll removida para otimização
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSliderPos(Number(e.target.value));
  };

  return (
  <div ref={sectionRef} className="w-full py-16">
      <div className="flex justify-between mb-4 text-lg font-playfair text-gray-700 dark:text-gray-300"
        style={{ paddingLeft: 'calc((100vw - 92vw)/2 + 24px)', paddingRight: 'calc((100vw - 92vw)/2 + 24px)' }}>
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </div>
      <div ref={containerRef} className="relative w-[92vw] mx-auto h-[40vw] max-h-[900px] min-h-[340px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Before Image */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100-sliderPos}% 0 0)` }}
        />
        {/* After Image */}
        <img
          src={afterSrc}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        />
        {/* Slider Bar */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{ left: `${sliderPos}%`, width: '2px', background: 'rgba(60,26,123,0.7)', boxShadow: '0 0 8px 2px rgba(147,51,234,0.25)' }}
        />
      </div>
      <div className="flex justify-center mt-8">
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPos}
          onChange={handleSliderChange}
          className="w-64 h-3 rounded-full bg-gray-200 dark:bg-gray-700 accent-purple-600"
        />
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
