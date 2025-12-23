"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck, Truck, Ruler, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext"; // <--- Importe aqui

interface Attribute {
  id: number;
  attribute_name: string;
  value: string;
}

interface ProductActionsProps {
  attributes: Attribute[];
  productName: string;
  price: string; // Precisamos do preço para o carrinho
  productId: number; // Precisamos do ID
  productImage: string; // Precisamos da Imagem
}

export default function ProductActions({ attributes, productName, price, productId, productImage }: ProductActionsProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [engravingText, setEngravingText] = useState("");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Hook do Carrinho
  const { addToCart } = useCart();
  const WHATSAPP_NUMBER = "5511999999999";

  const groupedAttributes = attributes.reduce((acc, curr) => {
    if (!acc[curr.attribute_name]) acc[curr.attribute_name] = [];
    acc[curr.attribute_name].push(curr.value);
    return acc;
  }, {} as Record<string, string[]>);

  // Lógica de Adicionar ao Carrinho
  const handleAddToCart = () => {
    // Validação simples: se tem atributos, obriga a escolher
    const requiredAttributes = Object.keys(groupedAttributes);
    const missing = requiredAttributes.filter(attr => !selectedAttributes[attr]);
    
    if (missing.length > 0) {
      alert(`Por favor, selecione: ${missing.join(", ")}`);
      return;
    }

    addToCart({
      id: productId,
      name: productName,
      price: parseFloat(price.replace(",", ".")), // Converte string "159.99" para number
      image: productImage,
      quantity: 1,
      selectedSize: JSON.stringify(selectedAttributes),
      engraving: engravingText
    });
  };

  const handleWhatsAppClick = () => {
    let message = `Olá! Tenho interesse na joia *${productName}*.`;
    const attrs = Object.entries(selectedAttributes).map(([k, v]) => `- ${k}: ${v}`).join('\n');
    if (attrs) message += `\n\nSelecionei:\n${attrs}`;
    if (engravingText) message += `\n\nGravação: *${engravingText}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-serif font-bold mb-4 flex items-center text-emerald-900"><Ruler className="w-5 h-5 mr-2" /> Guia de Medidas</h3>
            <p className="text-sm text-gray-600">Use um barbante para medir a circunferência do dedo.</p>
          </div>
        </div>
      )}

      {/* Seletores com Design Refinado */}
      <div className="space-y-6 mb-8">
        {Object.entries(groupedAttributes).map(([name, values]) => (
          <div key={name}>
            <div className="flex justify-between mb-3 items-baseline">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{name}:</h3>
              {(name.toLowerCase().includes('aro') || name.toLowerCase().includes('tamanho')) && (
                <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-gray-500 underline hover:text-emerald-700 transition flex items-center">
                  <Ruler className="w-3 h-3 mr-1"/> Como saber meu tamanho?
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {values.map((val) => (
                <button
                  key={val}
                  onClick={() => setSelectedAttributes(prev => ({ ...prev, [name]: val }))}
                  className={`px-6 py-2 text-sm font-medium border transition-all duration-200 ${
                    selectedAttributes[name] === val 
                    ? "border-emerald-900 bg-emerald-900 text-white shadow-md transform scale-105" 
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Gravação Especial (Opcional)</label>
        <input 
          type="text" 
          placeholder="Ex: Amor Eterno 12/06" 
          value={engravingText} 
          onChange={(e) => setEngravingText(e.target.value)} 
          className="w-full px-4 py-3 border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition bg-gray-50 focus:bg-white placeholder-gray-400" 
        />
      </div>

      <div className="flex flex-col gap-4">
        {/* Botão de Adicionar - Agora Funcional */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-emerald-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 active:scale-[0.99]"
        >
          <ShoppingBag className="w-5 h-5" /> Adicionar à Sacola
        </button>
        
        <button 
          onClick={handleWhatsAppClick} 
          className="w-full border border-emerald-900 text-emerald-900 py-4 font-bold uppercase tracking-widest hover:bg-emerald-50 transition-colors flex items-center justify-center gap-3"
        >
          <MessageCircle className="w-5 h-5" /> Personalizar no WhatsApp
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-8 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Garantia Vitalícia</div>
        <div className="flex items-center justify-center gap-2"><Truck className="w-4 h-4 text-emerald-600" /> Frete Grátis Brasil</div>
      </div>
    </>
  );
}