"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // <--- Importante para o botão funcionar
import { getProducts } from "@/services/api";

// Atualizei a tipagem para incluir a imagem e o slug
interface ProductImage {
  id: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  slug: string; // Precisamos disso para o link
  base_price: string;
  category_name: string;
  images: ProductImage[]; // Lista de imagens que vem do Django
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-emerald-800">
        Coleção Exclusiva
      </h1>

      {loading ? (
        <p className="text-lg text-gray-600 animate-pulse">Carregando joias...</p>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="text-center col-span-3">
              <p className="text-red-500 font-bold">Nenhum produto encontrado.</p>
              <p className="text-sm text-gray-500">Cadastre produtos com fotos no Admin!</p>
            </div>
          ) : (
            products.map((product) => {
              // Pega a primeira imagem ou usa um placeholder se não tiver foto
              const coverImage = product.images.length > 0 
                ? product.images[0].image 
                : null;

              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 overflow-hidden flex flex-col">
                  
                  {/* --- 1. ÁREA DA IMAGEM --- */}
                  <div className="h-64 w-full bg-gray-100 relative">
                    {coverImage ? (
                      <img 
                        src={coverImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem Foto
                      </div>
                    )}
                  </div>

                  {/* --- 2. INFORMAÇÕES --- */}
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">
                      {product.category_name}
                    </span>
                    <h2 className="text-xl font-serif text-gray-900 mb-2">{product.name}</h2>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                      <span className="text-lg font-bold text-gray-900">
                        R$ {product.base_price}
                      </span>
                      
                      {/* --- 3. BOTÃO AGORA COM LINK --- */}
                      <Link href={`/produto/${product.slug}`}>
                        <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition">
                          Ver Detalhes
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}