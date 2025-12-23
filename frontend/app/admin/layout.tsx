"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // usePathname adicionado aqui
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Pega a rota atual

  useEffect(() => {
    // Se não estiver carregando e não estiver logado, chuta pro login
    // Mas permite ficar na própria página de login para não criar loop
    if (!loading && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [loading, isAuthenticated, router, pathname]);

  // Se for a página de login, renderiza sem sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Se não estiver logado (e não for login), mostra nada enquanto redireciona
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        {children}
      </div>
    </div>
  );
}