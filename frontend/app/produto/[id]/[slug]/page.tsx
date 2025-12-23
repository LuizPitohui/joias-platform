"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getProductById, getRelatedProducts } from "@/services/api";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductActions from "@/components/product/ProductActions";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductReviews from "@/components/product/ProductReviews";

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  base_price: string;
  images: any[];
  attributes: any[];
  slug: string;
}

export default function ProductPage() {
  const params = useParams(); 
  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // MUDANÇA 2: Pegamos o ID da URL
      // params.id vem da pasta [id]
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      
      if (id) {
        setLoading(true);
        // MUDANÇA 3: Buscamos pelo ID
        const data = await getProductById(id);
        setProduct(data);

        // Carrega relacionados
        const allProducts = await getRelatedProducts();
        if (data) {
           setRelatedProducts(allProducts.filter((p: any) => p.id !== data.id).slice(0, 4));
        }
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]); // Monitora mudanças no ID

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Carregando joia...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-white">Produto não encontrado.</div>;

  return (
    <main className="min-h-screen bg-white py-12">
        {/* ... O RESTO DO CÓDIGO HTML PERMANECE IGUAL ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-emerald-800 mb-8 transition group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar para a loja
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                 <div className="lg:col-span-7">
                    <ProductGallery images={product.images} productName={product.name} />
                 </div>
                 <div className="lg:col-span-5 flex flex-col">
                    <ProductInfo name={product.name} price={product.base_price} />
                    <div className="border-t border-gray-100 my-6"></div>
                    <ProductActions 
                        productId={product.id}
                        productImage={product.images[0]?.image}
                        price={product.base_price}
                        attributes={product.attributes} 
                        productName={product.name} 
                    />
                 </div>
            </div>
            
            <div className="mb-20">
                <h2 className="text-2xl font-serif text-gray-900 mb-6 border-b border-gray-100 pb-4">Detalhes da Joia</h2>
                <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed">
                    {product.description?.split('\n').map((line: string, i: number) => (
                    <p key={i} className="mb-4">{line}</p>
                    ))}
                </div>
            </div>

            <RelatedProducts products={relatedProducts} />
            <ProductReviews />
        </div>
    </main>
  );
}