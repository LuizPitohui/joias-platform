"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Package, MapPin, Mail, Calendar, 
  CheckCircle2, Loader2, ShoppingBag, User, Phone 
} from "lucide-react";
import { getOrderDetails, updateOrderStatus } from "@/services/api";
import Link from "next/link";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function loadOrder() {
    setLoading(true);
    try {
      const data = await getOrderDetails(id as string);
      setOrder(data);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setUpdating(true);
    try {
      await updateOrderStatus(id as string, newStatus);
      await loadOrder(); // Recarrega os dados para atualizar o status na tela
    } catch (error) {
      alert("Erro ao atualizar status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] w-full">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-500" />
      </div>
    );
  }

  if (!order) return <div className="p-10 text-center dark:text-gray-400">Pedido não encontrado.</div>;

  const date = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Extração inteligente dos dados do cliente (baseado no que vimos do seu Django)
  const clientName = order.guest_name || order.customer_name || order.user?.first_name || "Nome não informado";
  const clientEmail = order.guest_email || order.email || order.customer_email || order.user?.email || "E-mail não informado";
  const clientPhone = order.guest_phone || order.phone || order.telefone || order.cellphone || "Telefone não informado";

  return (
    <div className="w-full animate-fadeIn pb-20 transition-colors duration-300">
      {/* Voltar */}
      <Link href="/admin/pedidos" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors group text-sm font-medium w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para a lista
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white">
            Pedido {order.order_number ? order.order_number : `#${order.id}`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 flex items-center mt-2 text-sm">
            <Calendar className="w-4 h-4 mr-2" /> Realizado em {date}
          </p>
        </div>

        {/* AÇÕES DE STATUS */}
        <div className="flex flex-wrap gap-3 items-center">
          {updating && <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400 mr-2" />}
          <select 
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer font-semibold"
          >
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
{/* COLUNA DA ESQUERDA: ITENS DO PEDIDO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <Package className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-500" /> Itens do Pedido
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items?.map((item: any) => {
                
                // --- NOVA MÁGICA COM OS DADOS REAIS DO DJANGO ---
                // Agora pegamos a imagem real que arrumamos no serializer
                const imageUrl = item.product_image; 
                const sku = item.product_sku; // Opcional
                
                // Separamos os atributos para criar badges específicos
                // O Django manda: [{name: "Material", value: "Ouro"}, {name: "Tamanho", value: "18"}]
                const attributes = item.product_attributes || [];
                const materialObj = attributes.find((a: any) => a.name.toLowerCase().includes('material'));
                const sizeObj = attributes.find((a: any) => a.name.toLowerCase().includes('tamanho') || a.name.toLowerCase().includes('size'));
                
                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
                    
                    {/* FOTO E DETALHES */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      
                      {/* CAIXA DA IMAGEM */}
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 shadow-sm">
                        {imageUrl ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={imageUrl} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                           <ShoppingBag className="text-gray-300 dark:text-gray-600 w-8 h-8" />
                        )}
                      </div>
                      
                      {/* INFORMAÇÕES TÉCNICAS */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-base truncate pr-4">
                          {item.product_name || "Produto sem nome"}
                        </h4>
                        
                        {/* BADGES DE ESPECIFICAÇÕES DINÂMICOS */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {sku && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                              SKU: {sku}
                            </span>
                          )}
                          
                          {/* Renderiza o tamanho se existir */}
                          {sizeObj && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                              Tam: {sizeObj.value}
                            </span>
                          )}
                          
                          {/* Renderiza o material se existir */}
                          {materialObj && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
                              {materialObj.value}
                            </span>
                          )}

                          {/* Renderiza atributos extras (ex: Cor da Pedra) que não sejam material nem tamanho */}
                          {attributes.map((attr: any, idx: number) => {
                            if (attr.name !== materialObj?.name && attr.name !== sizeObj?.name) {
                              return (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                                  {attr.name}: {attr.value}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Qtd: {item.quantity}</p>
                      </div>
                    </div>

                    {/* PREÇO */}
                    <div className="sm:text-right pt-2 sm:pt-0 shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white text-lg">R$ {Number(item.price).toFixed(2)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Total: R$ {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                    </div>

                  </div>
                );
              })}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/30 p-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">Total do Pedido</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">R$ {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: INFORMAÇÕES DO CLIENTE E LOGÍSTICA */}
        <div className="space-y-6">
          
          {/* CARTÃO DE CONTATO ENRIQUECIDO */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-500" /> Dados do Cliente
            </h3>
            
            <div className="space-y-5">
              {/* Nome */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Nome Completo</p>
                <p className="text-gray-900 dark:text-white font-medium flex items-center">
                  {clientName}
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">E-mail</p>
                <p className="text-gray-900 dark:text-white font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {clientEmail}
                </p>
              </div>

              {/* Telefone */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Telefone / WhatsApp</p>
                <p className="text-gray-900 dark:text-white font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {clientPhone}
                </p>
              </div>
            </div>
          </div>

            {/* CARTÃO DE ENDEREÇO */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-600 dark:text-red-500" /> Endereço de Entrega
            </h3>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
               <p className="text-sm leading-relaxed whitespace-pre-line">
                {order.address ? (
                  <>{order.address}</>
                ) : (
                  <span className="italic text-gray-400">Endereço detalhado não fornecido.</span>
                )}
               </p>
            </div>
          </div>

          {/* CARTÃO DE DICA DE LOGÍSTICA */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 transition-colors">
            <h4 className="text-emerald-800 dark:text-emerald-400 font-bold mb-2 flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Dica de Logística
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-500 leading-relaxed">
              O status do pedido determina o que o cliente vê na área "Meus Pedidos" da loja. Ao mudar para <strong>"Enviado"</strong>, você sinaliza que o produto já está com a transportadora.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}