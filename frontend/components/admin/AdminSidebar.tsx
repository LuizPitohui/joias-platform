"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  LogOut, 
  Gem, 
  Sun, 
  Moon,
  Settings // Importamos o ícone de engrenagem
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin_theme");
    
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newThemeMode = !isDarkMode;
    setIsDarkMode(newThemeMode);
    
    if (newThemeMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("admin_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("admin_theme", "light");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // ADICIONADO: Configurações no menu
  const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Pedidos", icon: ShoppingBag, href: "/admin/pedidos" },
    { name: "Produtos", icon: Package, href: "/admin/produtos" },
    { name: "Clientes", icon: Users, href: "/admin/clientes" },
    { name: "Configurações", icon: Settings, href: "/admin/configuracoes" }, // Rota da nova página
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full transition-colors duration-300">
      
      {/* LOGO */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Gem className="w-6 h-6 text-emerald-600 dark:text-emerald-500 mr-2" />
        <span className="font-serif font-bold text-lg tracking-widest text-gray-900 dark:text-white uppercase">
          Admin Hub
        </span>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2 shrink-0">
        
        {/* BOTÃO DARK MODE */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors duration-200 group"
        >
          <span className="font-medium flex items-center group-hover:text-gray-900 dark:group-hover:text-gray-200 text-sm">
            {isDarkMode ? <Sun className="w-5 h-5 mr-3 text-amber-500" /> : <Moon className="w-5 h-5 mr-3 text-indigo-400" />}
            {isDarkMode ? "Modo Claro" : "Modo Escuro"}
          </span>
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-bold text-sm">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}