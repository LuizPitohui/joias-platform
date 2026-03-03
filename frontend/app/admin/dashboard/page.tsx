"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAdminDashboardStats } from "@/services/api";
import { DollarSign, ShoppingBag, Package, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 1. Espião de Tema: Sincroniza o Gráfico com a mudança feita na Sidebar
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 2. Busca de Dados
  useEffect(() => {
    if (user && !user.is_staff) {
      router.push("/");
      return;
    }

    if (user && user.is_staff) {
      getAdminDashboardStats()
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] w-full">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="w-full transition-colors duration-300 animate-fadeIn">
      
      {/* CABEÇALHO DO DASHBOARD (Sem o botão de tema) */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-800 dark:text-gray-100">Visão Geral</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Bem-vindo(a) de volta, {user?.first_name || 'Admin'}!</p>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Vendas Hoje", value: `R$ ${stats?.vendas_hoje?.toFixed(2) || '0.00'}`, icon: DollarSign, color: "bg-blue-500" },
          { title: "Pedidos", value: stats?.pedidos_total || '0', icon: ShoppingBag, color: "bg-emerald-500" },
          { title: "Produtos Ativos", value: stats?.produtos_ativos || '0', icon: Package, color: "bg-purple-500" },
          { title: "Ticket Médio", value: `R$ ${stats?.ticket_medio?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: "bg-orange-500" },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center transition-colors">
            <div className={`p-4 rounded-full text-white mr-4 ${stat.color} shadow-md`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1 truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ÁREA DO GRÁFICO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:p-8 transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Faturamento (Últimos 7 dias)</h3>
        
        <div className="w-full" style={{ width: '100%', height: 400, minHeight: 400 }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={400}>
            <AreaChart data={stats?.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#f3f4f6'} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  color: isDarkMode ? '#f9fafb' : '#111827',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
                labelStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}