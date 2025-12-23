"use client";

import { useEffect, useState } from "react";
import { getProducts, getCategories, getProductsByCategory } from "@/services/api";
import ProductRow from "@/components/ProductRow";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  promotional_price?: string | null;
  images: any[];
}

export default function Home() {
  // Estados para cada seção do diagrama
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  
  // Categorias Dinâmicas (Anéis, Colares, Brincos)
  const [cat1Products, setCat1Products] = useState<Product[]>([]);
  const [cat2Products, setCat2Products] = useState<Product[]>([]);
  const [cat3Products, setCat3Products] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      
      // 1. Busca todos os produtos para filtrar Novidades e Ofertas
      const allProducts = await getProducts();
      
      // Lógica Novidades: Os últimos cadastrados (Inverte o array e pega 5)
      // Como o ID cresce, os ultimos IDs são os mais novos
      const sortedByNew = [...allProducts].sort((a, b) => b.id - a.id);
      setNewArrivals(sortedByNew);

      // Lógica Ofertas: Produtos com promotional_price
      const productsWithOffers = allProducts.filter((p: Product) => p.promotional_price);
      setOffers(productsWithOffers);

      // 2. Busca produtos das categorias específicas para as linhas de baixo
      // (No futuro, o Admin Panel vai definir quais slugs aparecem aqui)
      const dataCat1 = await getProductsByCategory('aneis');
      setCat1Products(dataCat1);

      const dataCat2 = await getProductsByCategory('colares');
      setCat2Products(dataCat2);

      const dataCat3 = await getProductsByCategory('brincos');
      setCat3Products(dataCat3);

      setLoading(false);
    }
    loadHomeData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Carregando vitrine...</div>;

  return (
    <main className="bg-white min-h-screen">
      
      {/* Banner Hero (Opcional, mas comum em homes) */}
      <div className="w-full bg-emerald-900 text-white py-16 px-4 text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-serif mb-4">Elegância Eterna</h1>
        <p className="text-emerald-100 max-w-xl mx-auto mb-8">Descubra a nova coleção de joias artesanais feitas para brilhar em todos os momentos.</p>
        <Link href="/categoria/aneis" className="bg-white text-emerald-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition">
          Ver Coleção
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* SEÇÃO 1: NOVIDADES (Diagrama item 22 e cards) */}
        <ProductRow 
          title="Novidades" 
          products={newArrivals} 
          seeMoreLink="/categoria/novidades" // Podemos criar essa rota depois ou apontar para 'aneis'
        />

        {/* SEÇÃO 2: OFERTAS (Diagrama item 23 e cards) */}
        {offers.length > 0 && (
          <ProductRow 
            title="Ofertas Especiais" 
            products={offers} 
            seeMoreLink="/ofertas" 
          />
        )}

        {/* SEÇÕES 3, 4, 5: CATEGORIAS (Diagrama itens 56, 57, 58) */}
        <ProductRow 
          title="Anéis Exclusivos" 
          products={cat1Products} 
          seeMoreLink="/categoria/aneis" 
        />

        <ProductRow 
          title="Colares" 
          products={cat2Products} 
          seeMoreLink="/categoria/colares" 
        />

        <ProductRow 
          title="Brincos" 
          products={cat3Products} 
          seeMoreLink="/categoria/brincos" 
        />

      </div>
    </main>
  );
}