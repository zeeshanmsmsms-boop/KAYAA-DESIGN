import React from 'react';
import { Download, Maximize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GeneratedImage } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  productCode: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, productCode }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `Jewelry_${image.type}_8K.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-zinc border border-[#222] rounded-[16px] overflow-hidden aspect-square flex flex-col"
    >
      {/* Label and Badge (Original UI) */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-white/70 border border-white/10 z-20">
        8K UHD
      </div>
      
      {/* KAYAA Logo Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-sm border border-black/5 flex flex-col items-center leading-none">
          <span className="font-serif text-[14px] font-bold tracking-[3px] text-ink mb-1">KAYAA</span>
          <div className="w-full h-px bg-ink/10 mb-1" />
          <span className="font-sans text-[7px] tracking-[2px] text-ink/70 font-bold uppercase">Clothing</span>
        </div>
      </div>

      <div className="relative flex-grow overflow-hidden">
        <img
          src={image.url}
          alt={image.type}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
        />
        
        {/* Model Number Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="font-serif italic text-white/90 text-sm tracking-[1px] drop-shadow-lg">
            {productCode}
          </div>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handleDownload}
            className="bg-white text-ink text-[11px] font-bold px-4 py-2 rounded-sm uppercase tracking-wider hover:bg-gold transition-colors shadow-xl"
          >
            Download
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent pointer-events-none" />
    </motion.div>
  );
};
