"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/services/api";
import { ArrowLeft, CheckCircle, MapPin, User, CreditCard } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  // CORREÇÃO 1: Usando 'items' em vez de 'cartItems'
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // CORREÇÃO 2: Calculando o total aqui (já que o Context pode não estar exportando 'cartTotal')
  const cartTotal = items ? items.reduce((acc, item) => {
    const price = typeof item.base_price === 'string' ? parseFloat(item.base_price) : Number(item.price || 0);
    return acc + (price * item.quantity);
  }, 0) : 0;

  // Formulário do Cliente
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");

  // Proteção contra undefined
  const safeItems = items || [];

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Prepara os dados pro Backend
      const payload = {
        guest_name: name,
        guest_email: email,
        address: address,
        total: cartTotal,
        // Transforma o carrinho no formato que o Serializer espera
        items_data: safeItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: typeof item.base_price === 'string' ? parseFloat(item.base_price) : item.price
        }))
      };

      // 2. Envia
      await createOrder(payload);

      // 3. Sucesso!
      clearCart(); // Limpa carrinho
      alert("Pedido realizado com sucesso! 🎉");
      router.push("/"); 

    } catch (error) {
      alert("Erro ao finalizar compra. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Verificação de carrinho vazio (usando safeItems)
  if (safeItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-serif text-gray-800 mb-4">Seu carrinho está vazio</h2>
        <Link href="/" className="text-emerald-800 hover:underline">Voltar para a loja</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-800 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Continuar Comprando
        </Link>

        <h1 className="text-3xl font-serif text-gray-900 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Dados Pessoais */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <User className="w-5 h-5 text-emerald-700" /> Seus Dados
              </h2>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Nome Completo" required
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  value={name} onChange={e => setName(e.target.value)}
                />
                <input 
                  type="email" placeholder="Seu Email" required
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <MapPin className="w-5 h-5 text-emerald-700" /> Entrega
              </h2>
              <textarea 
                placeholder="Endereço completo (Rua, Número, Bairro, CEP...)" required
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                value={address} onChange={e => setAddress(e.target.value)}
              ></textarea>
            </div>

            {/* Pagamento (Visual apenas por enquanto) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <CreditCard className="w-5 h-5 text-emerald-700" /> Pagamento
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 rounded-lg border text-center transition ${paymentMethod === 'pix' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  PIX
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border text-center transition ${paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  Cartão
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: RESUMO */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {safeItems.map((item, index) => {
                   const price = typeof item.base_price === 'string' ? parseFloat(item.base_price) : Number(item.price || 0);
                   return (
                      <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-gray-900">R$ {(price * item.quantity).toFixed(2)}</span>
                      </div>
                   );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Frete</span>
                  <span className="text-emerald-600">Grátis</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinishOrder}
                disabled={loading || !name || !email || !address}
                className="w-full bg-black text-white py-4 rounded-lg font-bold mt-8 hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Processando..." : <><CheckCircle className="w-5 h-5" /> Confirmar Pedido</>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}