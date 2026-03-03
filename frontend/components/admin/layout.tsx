"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/admin/Header";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Proteção Global de Rota para todo o Admin
  useEffect(() => {
    if (user === null) {
      router.push("/login");
    } else if (user && !user.is_staff) {
      router.push("/");
    } else {
      setIsChecking(false);
    }
  }, [user, router]);

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    // Removi qualquer limite de largura aqui e garanti o flex
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Menu Lateral Fixo */}
      <Sidebar />
      
      {/* Área de Conteúdo Principal (Ocupa 100% do espaço restante) */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        <Header />
        
        {/* O children é onde as páginas vão renderizar (com scroll próprio) */}
        <main className="flex-1 p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}