"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Ao carregar a página, verifica se já tem token salvo
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
      // Configura o token em todas as requisições futuras
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    try {
      // 1. Pede o token pro Django (endpoint padrão do SimpleJWT)
      const response = await api.post("/token/", { username, password });
      
      const { access, refresh } = response.data;

      // 2. Salva no navegador
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // 3. Configura a API
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setIsAuthenticated(true);
      router.push("/admin/dashboard"); // Manda pro painel
    } catch (error) {
      console.error("Erro no login", error);
      throw new Error("Usuário ou senha inválidos");
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    router.push("/admin/login");
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);