"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // usePathname adicionado aqui
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 1. Se não estiver logado -> Manda pro Login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // 2. Se estiver logado MAS NÃO FOR STAFF -> Manda pra Home (Segurança)
      if (user && !user.is_staff) {
        alert("Acesso negado. Área restrita para administradores.");
        router.push("/");
      }
    }
  }, [user, loading, isAuthenticated, router]);

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  // Se não for admin, não renderiza nada enquanto redireciona
  if (!user?.is_staff) return null; 

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}