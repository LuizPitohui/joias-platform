"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/services/api"; // Usar api direta para filtros customizados
import ProductFilters from "@/components/ProductFilters"; // <--- Importe

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pega o último slug (ex: 'solitarios')
  const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];
  const targetSlug = slugArray[slugArray.length - 1];

  // Função central de busca com filtros
  async function fetchProducts(filters: any = {}) {
    setLoading(true);
    try {
      // Monta a URL base: /products/?category__slug=aneis
      let url = `/products/?category__slug=${targetSlug}`;

      // Adiciona filtros extras se existirem
      if (filters.min_price) url += `&base_price__gt=${filters.min_price}`;
      if (filters.max_price) url += `&base_price__lt=${filters.max_price}`;
      
      // Filtro de Atributo (Material)
      if (filters.material && filters.material.length > 0) {
        // Exemplo simples: pega o primeiro selecionado (Django filter simples)
        // Para múltiplo necessitaria de lógica "in" mais complexa no backend
        url += `&attributes__value=${filters.material[0]}`;
      }

      const response = await api.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar", error);
    } finally {
      setLoading(false);
    }
  }

  // Carrega inicial
  useEffect(() => {
    if (targetSlug) fetchProducts();
  }, [targetSlug]);

  const categoryTitle = targetSlug 
    ? targetSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
    : "Categoria";

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
           <Link href="/" className="text-gray-400 hover:text-black flex items-center gap-2 mb-4"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
           <h1 className="text-4xl font-serif text-gray-900 capitalize">{categoryTitle}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* COLUNA 1: FILTROS (Sidebar) */}
          <div className="hidden lg:block">
            <ProductFilters onFilterChange={(f) => fetchProducts(f)} />
          </div>

          {/* COLUNA 2: PRODUTOS */}
          <div className="lg:col-span-3">
             {loading ? (
               <p>Carregando...</p>
             ) : products.length === 0 ? (
               <div className="p-8 bg-gray-50 rounded text-center">Nenhum produto com esses filtros.</div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {products.map((product) => (
                    <Link key={product.id} href={`/produto/${product.id}/${product.slug}`} className="group block">
                      <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
                        <img src={product.images[0]?.image} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>
                      <h3 className="font-serif text-lg">{product.name}</h3>
                      <p className="font-bold">R$ {product.base_price}</p>
                    </Link>
                 ))}
               </div>
             )}
          </div>
        </div>

      </div>
    </main>
  );
}