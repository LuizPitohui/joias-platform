"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      if (user && !user.is_staff) {
        alert("Acesso negado. Área restrita para administradores.");
        router.push("/");
      }
    }
  }, [user, loading, isAuthenticated, router]);

  if (loading) return <div className="p-10 text-center flex items-center justify-center min-h-screen text-gray-500 dark:bg-gray-950">Carregando painel...</div>;

  if (!user?.is_staff) return null; 

  return (
    // CORREÇÃO: Adicionado dark:bg-gray-950 para o fundo mudar de cor
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans w-full overflow-hidden transition-colors duration-300">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-300 ease-in-out`}>
        <AdminSidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        
        {/* CORREÇÃO: Cabeçalho mobile agora tem dark mode também */}
        <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between z-30 shadow-sm transition-colors duration-300">
          <div className="font-serif font-bold text-lg tracking-widest text-emerald-800 dark:text-emerald-500">
            ADMIN
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
      
    </div>
  );
}