"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, ShoppingBag, Loader2 } from "lucide-react";
import { getOrders } from "@/services/api";

// 1. Tipagem ajustada com os nomes exatos do seu Django
interface Order {
  id: string | number;
  order_number: string;
  guest_name?: string;     // <-- O nome que veio da API
  guest_email?: string;    // <-- O email que veio da API
  customer_email?: string;
  email?: string;
  user_email?: string;
  user?: { email: string; first_name?: string };
  total: string;
  status: string;
  created_at: string;
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500" },
    paid: { label: "Pago", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
    shipped: { label: "Enviado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    delivered: { label: "Entregue", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
    cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  };

  // 2. Agora ele vai puxar o nome do cliente (Ailer) primeiro!
  const getClientIdentifier = (order: Order) => {
    return order.guest_name || order.guest_email || order.customer_email || order.email || "Cliente não identificado";
  };
// 3. Filtro seguro que não quebra se o campo for undefined
  const filteredOrders = orders.filter(order => {
    const clientIdentifier = getClientIdentifier(order).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    // Agora ele busca também pelo order_number
    const orderIdString = order.order_number ? order.order_number.toLowerCase() : order.id.toString().toLowerCase();
    
    return (
      orderIdString.includes(searchLower) || 
      clientIdentifier.includes(searchLower)
    );
  });

  return (
    <div className="w-full animate-fadeIn transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 dark:text-white">Pedidos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Acompanhe as vendas e gerencie os envios da loja.</p>
      </div>

      {/* Busca */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex items-center gap-3 transition-colors duration-300">
        <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input 
          type="text" 
          placeholder="Buscar por ID ou Email do cliente..." 
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="p-16 flex justify-center items-center w-full">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center text-gray-400 dark:text-gray-500">
            <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum pedido encontrado.</p>
            <p className="text-sm mt-1">Tente ajustar os termos da sua busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">ID do Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrders.map((order) => {
                  const statusInfo = statusMap[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
                  const date = new Date(order.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });
                  
                  // Utilizando nossa função blindada para renderizar o cliente
                  const clientDisplay = getClientIdentifier(order);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 group">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {order.order_number ? order.order_number : `#${order.id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {clientDisplay}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-700 dark:text-emerald-400">
                        R$ {Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/pedidos/${order.id}`} 
                          className="inline-flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Ver Detalhes do Pedido"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}