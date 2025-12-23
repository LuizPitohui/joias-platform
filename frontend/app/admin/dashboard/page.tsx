"use client";

import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-serif text-gray-800 mb-8">Visão Geral</h1>

      {/* Cards de Estatísticas (Dados Fictícios por enquanto) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Vendas Hoje", value: "R$ 1.250", icon: DollarSign, color: "bg-blue-500" },
          { title: "Pedidos", value: "12", icon: ShoppingBag, color: "bg-emerald-500" },
          { title: "Produtos", value: "45", icon: Package, color: "bg-purple-500" },
          { title: "Ticket Médio", value: "R$ 310", icon: TrendingUp, color: "bg-orange-500" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-full text-white mr-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Área de conteúdo futuro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-96 flex flex-col items-center justify-center text-gray-400">
        <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
        <p>Em breve: Gráfico de vendas dos últimos 30 dias.</p>
      </div>
    </div>
  );
}