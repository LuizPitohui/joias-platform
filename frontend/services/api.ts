import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Variável para evitar loops infinitos de retry
interface CustomAxiosRequestConfig extends axios.AxiosRequestConfig {
  _retry?: boolean;
}

// --- INTERCEPTOR (O SEGURANÇA INTELIGENTE) ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Se o erro for 401 (Não Autorizado) e nós ainda não tentamos reenviar...
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca que já tentamos uma vez para não entrar em loop

      console.warn("Token inválido detectado. Tentando acesso como visitante...");

      // 1. Limpa o token do navegador
      if (typeof window !== 'undefined') {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }

      // 2. Remove o cabeçalho de autorização da instância global e da requisição atual
      delete api.defaults.headers.common['Authorization'];
      if (originalRequest.headers) {
          delete originalRequest.headers['Authorization']; // Remove do request atual
      }

      // 3. Se estivermos no Admin, manda pro login. Se for Loja Pública, tenta de novo sem token.
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
          return Promise.reject(error);
      } else {
          // Tenta fazer a mesma requisição de novo, agora limpa (como anônimo)
          return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// --- FUNÇÕES DE BUSCA ---

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
    // Filtra apenas quem tem preço promocional válido
    return response.data.filter((p: any) => p.promotional_price && parseFloat(p.promotional_price) > 0);
  } catch (error) {
    console.error('Erro ao buscar ofertas:', error);
    return [];
  }
};

// Função para deletar produto (Requer autenticação)
export const deleteProduct = async (id: number) => {
  try {
    await api.delete(`/products/${id}/`);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar produto ${id}:`, error);
    throw error;
  }
};

// Cria um produto enviando IMAGEM (precisa de FormData)
export const createProduct = async (productData: FormData) => {
  try {
    const response = await api.post("/products/", productData, {
      headers: {
        "Content-Type": "multipart/form-data", // Importante para envio de arquivos
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
};

// Atualiza produto (aceita FormData para caso tenha foto nova)
export const updateProduct = async (id: number | string, productData: FormData) => {
  try {
    const response = await api.patch(`/products/${id}/`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar produto ${id}:`, error);
    throw error;
  }
};

// Deleta uma imagem específica da galeria
export const deleteProductImage = async (imageId: number) => {
  try {
    await api.delete(`/product-images/${imageId}/`);
    return true;
  } catch (error) {
    console.error(`Erro ao deletar imagem ${imageId}:`, error);
    throw error;
  }
};

// Busca a lista de pedidos
export const getOrders = async () => {
  try {
    const response = await api.get("/orders/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
};

// Busca um pedido específico (usaremos em breve)
export const getOrderById = async (id: number | string) => {
  try {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar pedido ${id}:`, error);
    return null;
  }
};

// Cria um novo pedido (Checkout)
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