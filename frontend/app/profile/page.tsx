"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation"; // usePathname ajuda na proteção
import { api } from "@/services/api";

// 1. Interface Unificada
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean; // <--- O CAMPO MÁGICO QUE DIFERENCIA
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, refreshToken: string) => Promise<User | null>; // Agora retorna o User
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Certifique-se que seu backend retorna o campo 'is_staff' nesta rota
      const response = await api.get("/users/me/"); 
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao carregar perfil", error);
      // Não desloga automaticamente aqui para evitar loops se a API cair momentaneamente
      // mas se for 401, o interceptor do api.ts já vai cuidar do logout
    } finally {
      setLoading(false);
    }
    return null;
  };

  const login = async (token: string, refreshToken: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const userData = await fetchUserProfile();
    return userData; // Retorna os dados para a página de login decidir o redirecionamento
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    router.push("/login"); 
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);