"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Tipagem do Item no Carrinho
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  // Detalhes extras importantes para joias
  selectedSize?: string;
  engraving?: string;
  base_price?: string | number; // Adicionado para compatibilidade com backend se necessário
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void; // <--- ADICIONADO: A função que faltava
  cartCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Opcional: Salvar no LocalStorage para não perder ao recarregar
  useEffect(() => {
    const savedCart = localStorage.getItem("joias-cart");
    if (savedCart) setItems(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("joias-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      // Verifica se já existe um item igual (mesmo ID e mesmo tamanho)
      const existing = prev.find(
        (i) => i.id === newItem.id && i.selectedSize === newItem.selectedSize
      );
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id && i.selectedSize === newItem.selectedSize
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true); // Abre o carrinho automaticamente ao adicionar (Feedback visual)
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // --- NOVA FUNÇÃO: LIMPAR CARRINHO ---
  const clearCart = () => {
    setItems([]); // Zera o estado
    localStorage.removeItem("joias-cart"); // Limpa do navegador
  };

  // Soma a quantidade total de itens (ex: 2 anéis + 1 colar = 3 itens)
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        clearCart, // <--- Exportando a função para ser usada no Checkout
        cartCount, 
        isCartOpen, 
        toggleCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para usar fácil
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};