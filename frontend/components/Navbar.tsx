"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; 
import { Search, ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getCategories, api } from "@/services/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: Category[];
}

interface ProductSuggestion {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  images: { image: string }[];
}

export default function Navbar() {
  // 2. CHAMA O HOOK AQUI EM CIMA
  const pathname = usePathname(); 
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Estados da Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { toggleCart, totalItems } = useCart();
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 1. Carrega Categorias
  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCategories();
  }, []);

  // 2. Lógica do "Live Search" (Autocomplete)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const response = await api.get(`/products/?search=${searchTerm}`);
          setSuggestions(response.data.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error("Erro no autocomplete:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 3. Fecha as sugestões se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. AQUI É O LUGAR CERTO: Checa se é admin depois de carregar os hooks
  // Se for rota de admin, não mostra nada (retorna null)
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed w-full bg-white z-50 border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link href="/" className="text-2xl font-serif tracking-widest text-gray-900 z-50 hover:text-emerald-900 transition">
            JOALHERIA
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center space-x-8 h-full">
            <Link href="/" className="text-sm font-medium text-gray-900 hover:text-emerald-800 transition flex items-center h-full border-b-2 border-transparent hover:border-emerald-800">
              INÍCIO
            </Link>

            {categories.map((category) => (
              <div key={category.id} className="relative group h-full flex items-center">
                <Link 
                  href={`/categoria/${category.slug}`} 
                  className="text-sm font-medium text-gray-900 hover:text-emerald-800 transition flex items-center gap-1 h-full border-b-2 border-transparent group-hover:border-emerald-800 uppercase"
                >
                  {category.name}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-emerald-800" />
                  )}
                </Link>

                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="absolute left-0 top-full w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="py-2">
                      {category.subcategories.map((sub) => (
                        <Link 
                          key={sub.id} 
                          href={`/categoria/${category.slug}/${sub.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-800"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ÁREA DA DIREITA (Busca + Carrinho) */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* BUSCA COM AUTOCOMPLETE */}
            <div ref={searchContainerRef} className="relative group">
              <form onSubmit={handleSearchSubmit}>
                <input 
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm.length >= 2) setShowSuggestions(true); }}
                  className="pl-10 pr-4 py-1.5 text-sm bg-gray-50 border border-transparent rounded-full w-32 focus:w-72 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 transition-all duration-300 outline-none placeholder-gray-400 shadow-sm"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-800">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* SUGESTÕES DROPDOWN */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
                  <div className="p-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Sugestões
                  </div>
                  <ul>
                    {suggestions.map((product) => (
                      <li key={product.id}>
                        <Link 
                          href={`/produto/${product.id}/${product.slug}`} 
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-3 p-3 hover:bg-emerald-50 transition border-b border-gray-50 last:border-0 group"
                        >
                          <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                            {product.images?.[0]?.image ? (
                               <img src={product.images[0].image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500">Foto</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              R$ {product.base_price}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button className="text-gray-900 hover:text-emerald-800 transition"><User className="w-5 h-5" /></button>
            
            <button onClick={toggleCart} className="text-gray-900 hover:text-emerald-800 transition relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Botão Mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900 p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* MENU MOBILE */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-24 px-4 overflow-y-auto">
           <form onSubmit={handleSearchSubmit} className="mb-8 relative">
              <input 
                type="text" 
                placeholder="O que você procura?" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg text-base outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
           </form>

           <div className="space-y-4">
              <Link href="/" className="block text-lg font-bold text-gray-900" onClick={() => setIsMenuOpen(false)}>INÍCIO</Link>
              {categories.map((cat) => (
                <div key={cat.id} className="border-b border-gray-50 pb-2">
                  <Link href={`/categoria/${cat.slug}`} className="block text-lg font-medium text-gray-800 py-2 uppercase" onClick={() => setIsMenuOpen(false)}>
                    {cat.name}
                  </Link>
                  {cat.subcategories?.map(sub => (
                    <Link key={sub.id} href={`/categoria/${cat.slug}/${sub.slug}`} className="block text-sm text-gray-500 py-1 pl-4" onClick={() => setIsMenuOpen(false)}>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              ))}
           </div>
        </div>
      )}
    </nav>
  );
}