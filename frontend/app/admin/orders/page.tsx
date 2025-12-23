"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, ShoppingBag } from "lucide-react";
import { getOrders } from "@/services/api";

interface Order {
  id: number;
  customer_email: string;
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
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  }

  // Mapa de cores e textos para os status
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
    paid: { label: "Pago", color: "bg-emerald-100 text-emerald-800" },
    shipped: { label: "Enviado", color: "bg-blue-100 text-blue-800" },
    delivered: { label: "Entregue", color: "bg-purple-100 text-purple-800" },
    cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  };

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) || 
    order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-serif text-gray-800 mb-2">Pedidos</h1>
      <p className="text-gray-500 mb-8">Acompanhe as vendas da loja</p>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por ID ou Email do cliente..." 
          className="flex-1 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando vendas...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mb-3 opacity-50" />
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const statusInfo = statusMap[order.status] || { label: order.status, color: "bg-gray-100" };
                  const date = new Date(order.created_at).toLocaleDateString('pt-BR');

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 text-sm">{order.customer_email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-700">R$ {order.total}</td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/orders/${order.id}`} 
                          className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
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