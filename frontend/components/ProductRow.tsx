"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  promotional_price?: string | null;
  images: { image: string }[];
}

interface ProductRowProps {
  title: string;
  products: Product[];
  seeMoreLink: string;
}

export default function ProductRow({ title, products, seeMoreLink }: ProductRowProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 border-b border-gray-50 last:border-0">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
        <h2 className="text-2xl font-serif text-gray-900 capitalize relative">
          {title}
          <span className="absolute -bottom-2 left-0 w-12 h-1 bg-emerald-900 rounded-full"></span>
        </h2>
        <Link 
          href={seeMoreLink} 
          className="text-sm font-bold text-emerald-800 hover:text-emerald-600 flex items-center transition group"
        >
          Ver mais <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Grid de 5 Produtos (Responsivo: 1 no mobile, 2 no tablet, 5 no desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4 sm:px-0">
        {products.slice(0, 5).map((product) => {
           const cover = product.images.length > 0 ? product.images[0].image : null;
           const hasDiscount = product.promotional_price && parseFloat(product.promotional_price) < parseFloat(product.base_price);
           
           return (
            <Link key={product.id} href={`/produto/${product.id}/${product.slug}`} className="group block">
              <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-3 border border-gray-100 relative">
                
                {/* Badge de Oferta */}
                {hasDiscount && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 uppercase tracking-wide">
                    Oferta
                  </div>
                )}

                {cover ? (
                  <img 
                    src={cover} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem Foto</div>
                )}

                {/* Botão Hover */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-4">
                   <span className="bg-white text-black px-4 py-2 rounded shadow-lg font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                     Visualizar
                   </span>
                </div>
              </div>
              
              <div className="space-y-1">
                 <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-800 transition">{product.name}</h3>
                 
                 <div className="flex items-center gap-2">
                   {hasDiscount ? (
                     <>
                       <span className="text-sm font-bold text-red-700">R$ {product.promotional_price}</span>
                       <span className="text-xs text-gray-400 line-through">R$ {product.base_price}</span>
                     </>
                   ) : (
                     <span className="text-sm font-bold text-gray-900">R$ {product.base_price}</span>
                   )}
                 </div>

                 <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                   10x de R$ {(parseFloat((product.promotional_price || product.base_price).replace(',', '.'))/10).toFixed(2).replace('.', ',')}
                 </p>
              </div>
            </Link>
           );
        })}
      </div>
    </section>
  );
}