"use client";

import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartSidebar() {
  const { isCartOpen, toggleCart, items, removeFromCart } = useCart();
  const WHATSAPP_NUMBER = "5511999999999"; // Seu número aqui

  // Calcula o total
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (!isCartOpen) return null;

  // --- LÓGICA DO CHECKOUT WHATSAPP ---
//  const handleCheckout = () => {
//    // 1. Cabeçalho da mensagem
//    let message = `Olá! Gostaria de finalizar meu pedido no site:\n\n`;
//
    // 2. Lista os itens
//    items.forEach((item) => {
//      message += `💎 *${item.quantity}x ${item.name}*\n`;
//     message += `   Preço: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
      
      // Detalhes extras (Tamanho/Gravação)
//      if (item.selectedSize) {
//        const sizes = Object.values(JSON.parse(item.selectedSize)).join(', ');
//        message += `   Opções: ${sizes}\n`;
//     }
//      if (item.engraving) {
//        message += `   Gravação: "${item.engraving}"\n`;
//      }
//      message += `----------------\n`;
//    });

    // 3. Total
//    message += `\n💰 *Total do Pedido: R$ ${total.toFixed(2).replace('.', ',')}*`;
//    message += `\n\nAguardo instruções para pagamento/entrega.`;

    // 4. Abre o WhatsApp
//    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
//    window.open(url, '_blank');
//  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn" 
        onClick={toggleCart}
      />

      {/* Painel Lateral */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slideInRight">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Sua Sacola ({items.length})
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>Sua sacola está vazia.</p>
              <button onClick={toggleCart} className="text-emerald-800 font-bold underline hover:text-emerald-900">
                Ver novidades
              </button>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                   <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                      <p className="whitespace-nowrap">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    {item.selectedSize && (
                        <p className="mt-1 text-sm text-gray-500">{Object.values(JSON.parse(item.selectedSize)).join(', ')}</p>
                    )}
                    {item.engraving && (
                        <p className="mt-1 text-xs text-emerald-700 italic">✨ "{item.engraving}"</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <p className="text-gray-500">Qtd: {item.quantity}</p>
                    <button onClick={() => removeFromCart(item.id)} className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer com Checkout Funcional */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between text-lg font-bold text-gray-900 mb-2">
              <p>Total</p>
              <p>R$ {total.toFixed(2).replace('.', ',')}</p>
            </div>
            <p className="text-xs text-gray-500 mb-6 text-center">
              Frete calculado na próxima etapa.
            </p>
            
            <div className="space-y-3">
                {/* 2. MUDANÇA AQUI: Botão agora é um LINK para /checkout */}
                <Link
                  href="/checkout"
                  onClick={toggleCart} // Fecha a sidebar ao clicar
                  className="w-full flex items-center justify-center rounded-lg bg-emerald-900 px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-emerald-800 transition active:scale-[0.99] gap-2"
                >
                  Finalizar Compra <ArrowRight className="w-5 h-5" />
                </Link>
                
                <button
                  onClick={toggleCart}
                  className="w-full flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Continuar Comprando
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}