"use client";

import { useState, useCallback } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

interface ProductImage {
  id: number;
  image: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImageUrl = images?.[activeIndex]?.image || "";
  const hasMultipleImages = images.length > 1;

  // Funções de navegação (Mantidas iguais)
  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  if (!images || images.length === 0) return <div className="text-gray-300">Sem Foto</div>;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 h-[500px]">
      
      {/* Lightbox (Modal de Zoom) - Mantido igual */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"><X className="w-8 h-8" /></button>
          {hasMultipleImages && (
            <>
              <button onClick={handlePrev} className="absolute left-4 text-white p-2 bg-black/20 rounded-full hover:bg-black/50"><ChevronLeft className="w-10 h-10" /></button>
              <button onClick={handleNext} className="absolute right-4 text-white p-2 bg-black/20 rounded-full hover:bg-black/50"><ChevronRight className="w-10 h-10" /></button>
            </>
          )}
          <img src={activeImageUrl} alt="Zoom" className="max-w-full max-h-[90vh] object-contain select-none" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* 1. MINIATURAS (Agora na Esquerda e Vertical) */}
      <div className="hidden lg:flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar w-24 h-full">
        {images.map((img, index) => (
          <button 
            key={img.id} 
            onClick={() => setActiveIndex(index)}
            className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition ${activeIndex === index ? "border-black ring-1 ring-black" : "border-gray-200 hover:border-gray-400"}`}
          >
            <img src={img.image} alt="Thumbnail" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Versão Mobile das Miniaturas (Horizontal em baixo) */}
      <div className="flex lg:hidden space-x-4 overflow-x-auto pb-2 custom-scrollbar">
        {images.map((img, index) => (
          <button 
            key={img.id} 
            onClick={() => setActiveIndex(index)}
            className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition ${activeIndex === index ? "border-black" : "border-gray-200"}`}
          >
            <img src={img.image} alt="Thumbnail" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* 2. FOTO PRINCIPAL (Ocupa o resto do espaço) */}
      <div 
        className="flex-1 group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 cursor-zoom-in flex justify-center items-center h-full"
        onClick={() => setIsLightboxOpen(true)}
      >
        <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10">
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </div>
        <img src={activeImageUrl} alt={productName} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }} />
      </div>

    </div>
  );
}