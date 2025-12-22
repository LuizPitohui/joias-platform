"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories } from "@/services/api";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Category[]; // Auto-referência para filhos
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Busca as categorias ao carregar o site
  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCategories();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. LOGO (Futuramente virá do Painel Admin) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-serif text-gray-900 tracking-widest uppercase">
              Joalheria
            </Link>
          </div>

          {/* 2. MENU DESKTOP (Categorias Dinâmicas) */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-600 hover:text-black transition text-sm font-medium tracking-wide">
              INÍCIO
            </Link>
            
            {/* Loop para criar os links baseados no Banco de Dados */}
            {categories.map((category) => (
              <div key={category.id} className="relative group h-20 flex items-center">
                <Link 
                  href={`/categoria/${category.slug}`}
                  className="text-gray-600 group-hover:text-black transition text-sm font-medium tracking-wide"
                >
                  {category.name.toUpperCase()}
                </Link>

                {/* Dropdown de Subcategorias (se existirem) */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="absolute top-20 left-0 w-48 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top">
                    <div className="py-2">
                      {category.subcategories.map((sub) => (
                        <Link 
                          key={sub.id} 
                          href={`/categoria/${category.slug}/${sub.slug}`}
                          className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-black"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 3. ÍCONES (Busca, Login, Carrinho) */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-400 hover:text-black transition">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-black transition">
              <User className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-black transition relative">
              <ShoppingBag className="w-5 h-5" />
              {/* Bolinha de notificação do carrinho */}
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>
          </div>

          {/* 4. BOTÃO MOBILE (Hambúrguer) */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE (Expandido) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="pt-2 pb-4 space-y-1 px-4">
            {categories.map((category) => (
              <div key={category.id} className="py-2 border-b border-gray-50 last:border-0">
                <Link 
                  href={`/categoria/${category.slug}`}
                  className="block text-base font-medium text-gray-800"
                >
                  {category.name}
                </Link>
                {/* Subcategorias Mobile */}
                <div className="pl-4 mt-2 space-y-2">
                  {category.subcategories.map((sub) => (
                    <Link 
                      key={sub.id}
                      href={`/categoria/${category.slug}/${sub.slug}`}
                      className="block text-sm text-gray-500"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}