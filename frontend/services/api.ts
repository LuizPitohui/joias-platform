import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTOR DE REQUEST (Anexa o Token) ---
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Variável para evitar loops
interface CustomAxiosRequestConfig extends axios.AxiosRequestConfig {
  _retry?: boolean;
}

// --- INTERCEPTOR DE RESPOSTA (O Renovador de Sessão) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Se o erro for 401 (Não autorizado) e ainda não tentamos renovar...
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca para não entrar em loop infinito

      try {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
        
        // Se tivermos um token de renovação, tentamos salvar a sessão
        if (refreshToken) {
          console.log("Renovando sessão expirada...");
          
          const response = await axios.post("http://localhost:8000/api/token/refresh/", {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // 1. Salva o novo token
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access);
          }

          // 2. Atualiza o cabeçalho padrão para o futuro
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          // 3. Atualiza e repete a requisição original que tinha falhado
          if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se a renovação falhar (ex: refresh token também venceu), aí sim desloga
        console.error("Sessão expirada totalmente. Redirecionando para login.");
        
        if (typeof window !== "undefined") {
           localStorage.removeItem("access_token");
           localStorage.removeItem("refresh_token");
           
           // Opcional: Redirecionar para login
           // window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// --- FUNÇÕES DE BUSCA (Mantidas Iguais) ---

export const getProducts = async () => {
  try {
    const response = await api.get("/products/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get("/categories/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
};

export const getHomeCategories = async () => {
  try {
    const response = await api.get('/categories/?show_on_home=true');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias da home:', error);
    return [];
  }
};

export const getProductsByCategory = async (slug: string) => {
  try {
    const response = await api.get(`/products/?category__slug=${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produtos da categoria ${slug}:`, error);
    return [];
  }
};

export const getProductById = async (id: string | number) => {
  try {
    const response = await api.get(`/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    return null;
  }
};

export const getRelatedProducts = async () => {
  return getProducts(); 
};

export const getNewArrivals = async () => {
  try {
    const response = await api.get('/products/?ordering=-id');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar novidades:', error);
    return [];
  }
};

export const getOffers = async () => {
  try {
    const response = await api.get('/products/');
    return response.data.filter((p: any) => p.promotional_price && parseFloat(p.promotional_price) > 0);
  } catch (error) {
    console.error('Erro ao buscar ofertas:', error);
    return [];
  }
};

export const deleteProduct = async (id: number) => {
  try {
    await api.delete(`/products/${id}/`);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar produto ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (productData: FormData) => {
  try {
    const response = await api.post("/products/", productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
};

export const updateProduct = async (id: number | string, productData: FormData) => {
  try {
    const response = await api.patch(`/products/${id}/`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar produto ${id}:`, error);
    throw error;
  }
};

export const deleteProductImage = async (imageId: number) => {
  try {
    await api.delete(`/product-images/${imageId}/`);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar imagem ${imageId}:`, error);
    throw error;
  }
};

export const getOrderById = async (id: number | string) => {
  try {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar pedido ${id}:`, error);
    return null;
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const response = await api.post("/orders/", orderData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
};

// Endereços
export const getAddresses = async () => {
  const response = await api.get("/addresses/");
  return response.data;
};

export const createAddress = async (data: any) => {
  const response = await api.post("/addresses/", data);
  return response.data;
};

export const deleteAddress = async (id: number) => {
  await api.delete(`/addresses/${id}/`);
};

// --- PEDIDOS ---
export const getOrders = async () => {
  try {
    const response = await api.get("/orders/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    throw error;
  }
};