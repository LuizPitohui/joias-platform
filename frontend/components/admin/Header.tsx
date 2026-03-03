"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Lê a preferência atual quando o componente monta
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 transition-colors duration-300">
      <div className="h-full px-8 flex items-center justify-between">
        
        {/* Título Dinâmico (opcional) ou Saudação */}
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Bem-vindo de volta, <span className="text-gray-900 dark:text-white font-bold">{user?.first_name || 'Admin'}</span>
        </div>

        {/* Ações (Dark Mode e Notificações) */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>
          
          {/* Avatar do Usuário */}
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm ml-2">
            {user?.first_name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}