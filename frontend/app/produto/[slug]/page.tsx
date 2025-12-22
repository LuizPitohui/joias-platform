"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductBySlug } from "@/services/api";
import { ShieldCheck, Truck, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

// --- TIPAGENS ---
interface Attribute {
  id: number;
  attribute_name: string;
  value: string;
}

interface ProductImage {
  id: number;
  image: string;
}

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  base_price: string;
  images: ProductImage[];
  attributes: Attribute[];
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");
  
  // Guarda as escolhas do cliente (Ex: { Aro: "18", Material: "Ouro" })
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadProduct() {
      // O slug pode vir como array em alguns casos, garantimos que seja string
      const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
      
      if (slug) {
        const data = await getProductBySlug(slug);
        setProduct(data);
        if (data?.images?.length > 0) {
          setActiveImage(data.images[0].image);
        }
      }
      setLoading(false);
    }
    loadProduct();
  }, [params.slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando joia...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Produto não encontrado.</div>;

  // Agrupa atributos (Ex: Junta todos os "Aros" numa lista só)
  const groupedAttributes = product.attributes.reduce((acc, curr) => {
    if (!acc[curr.attribute_name]) acc[curr.attribute_name] = [];
    acc[curr.attribute_name].push(curr.value);
    return acc;
  }, {} as Record<string, string[]>);

  const handleSelect = (name: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Botão Voltar */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a loja
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- COLUNA DA ESQUERDA: FOTOS --- */}
          <div className="space-y-4">
            
            {/* Foto Principal (Com altura travada para não estourar) */}
            <div className="relative w-full h-96 lg:h-[500px] bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
               {activeImage ? (
                  <img 
                    src={activeImage} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-4" 
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">Sem Foto</div>
               )}
            </div>
            
            {/* Miniaturas (Com shrink-0 para não deformar) */}
            <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
              {product.images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.image)}
                  // O segredo está aqui: w-20 h-20 shrink-0
                  className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                    activeImage === img.image ? "border-black ring-1 ring-black" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img 
                    src={img.image} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* --- COLUNA DA DIREITA: DETALHES --- */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Exclusivo</span>
            <h1 className="text-4xl font-serif text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">R$ {product.base_price}</span>
              <div className="flex items-center text-yellow-500 text-sm bg-yellow-50 px-2 py-1 rounded">
                 <Star className="w-4 h-4 fill-current" />
                 <span className="ml-1 text-gray-700 font-medium">5.0</span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 border-b border-gray-100 pb-8">
              {product.description}
            </p>

            {/* Seletores de Atributos */}
            <div className="space-y-6 mb-8">
              {Object.entries(groupedAttributes).map(([name, values]) => (
                <div key={name}>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{name}:</h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleSelect(name, value)}
                        className={`px-4 py-2 text-sm border rounded-md transition ${
                          selectedAttributes[name] === value
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-700 hover:border-black"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3 mt-auto">
              <button className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition shadow-lg text-lg">
                Comprar Agora
              </button>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-4">
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded">
                  <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
                  Garantia Vitalícia
                </div>
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded">
                  <Truck className="w-5 h-5 mr-2 text-blue-600" />
                  Frete Grátis
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}