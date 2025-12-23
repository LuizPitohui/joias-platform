"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api"; // Certifique-se de importar o axios instance corretamente

// Componente interno que usa useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); // Pega o termo "ouro" da URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearch() {
      if (query) {
        setLoading(true);
        try {
          // Usa o endpoint de produtos com o filtro ?search=
          const response = await api.get(`/products/?search=${query}`);
          setProducts(response.data);
        } catch (error) {
          console.error("Erro na busca:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif text-gray-900 mb-2">
        Resultados para "{query}"
      </h1>
      <p className="text-gray-500 mb-8">{products.length} produtos encontrados</p>

      {loading ? (
        <div className="text-center py-20">Carregando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p>Nenhum produto encontrado com esse termo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product: any) => (
             <Link key={product.id} href={`/produto/${product.id}/${product.slug}`} className="group block">
               {/* Reutilizando o visual do card simples */}
               <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                 <img src={product.images[0]?.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
               </div>
               <h3 className="font-medium text-gray-900">{product.name}</h3>
               <p className="text-sm text-gray-500">R$ {product.base_price}</p>
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Página Principal com Suspense (Obrigatório no Next.js para usar useSearchParams)
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Carregando busca...</div>}>
      <main className="min-h-screen bg-white pt-20">
        <SearchContent />
      </main>
    </Suspense>
  );
}