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

    // 1. TRAVA DE SEGURANÇA MÁXIMA: 
    // Se a requisição que falhou for a PRÓPRIA TENTATIVA DE RENOVAR O TOKEN,
    // não tente interceptar de novo, apenas jogue o erro pra frente (quebra o loop).
    if (originalRequest.url?.includes('/token/refresh/')) {
       return Promise.reject(error);
    }

    // Se o erro for 401 (Não autorizado) e ainda não tentamos renovar...
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca para não entrar em loop infinito na requisição original

      try {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
        
        if (refreshToken) {
          console.log("Renovando sessão expirada...");
          
          // IMPORTANTE: Faz a requisição usando axios puro, sem passar pela instância "api"
          // Isso garante que essa chamada de renovação não caia nos nossos interceptors
          const response = await axios.post("http://localhost:8000/api/token/refresh/", {
            refresh: refreshToken,
          });

          const { access } = response.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access);
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          // Repete a requisição original com o novo token
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se a renovação falhar, limpa tudo e desloga silenciosamente
        console.error("Sessão expirada totalmente.");
        
        if (typeof window !== "undefined") {
           localStorage.removeItem("access_token");
           localStorage.removeItem("refresh_token");
           delete api.defaults.headers.common['Authorization'];
           // ATENÇÃO: Se quiser forçar o redirecionamento aqui, use window.location.href = '/login';
        }
        
        // Retorna o erro original para que as telas (como a de Produto) parem de tentar carregar
        return Promise.reject(refreshError);
      }
    }

    // Se não for 401, ou se a renovação já tentou e falhou, rejeita normalmente.
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

export const getSiteSettings = async () => {
  try {
    const response = await api.get("/settings/"); // Verifique se essa rota de settings existe no seu urls.py
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return null;
  }
};

export const getFAQs = async () => {
  try {
    const response = await api.get("/faqs/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar FAQs:", error);
    return [];
  }
};

// Pega as estatísticas do Admin
export const getAdminDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats/');
  return response.data;
};

// Puxa detalhes de UM pedido específico
export const getOrderDetails = async (id: string) => {
  const response = await api.get(`/orders/${id}/`);
  return response.data;
};

// Atualiza o status do pedido (Pendente -> Pago -> Enviado, etc)
export const updateOrderStatus = async (id: string, status: string) => {
  const response = await api.patch(`/orders/${id}/`, { status });
  return response.data;
};

// --- GERENCIAMENTO DE CATÁLOGO (Categorias e Atributos) ---

export const getAttributes = async () => {
  try {
    // Agora sim! Buscando as opções reais (Ouro 18k, Aro 16, etc)
    const response = await api.get("/attribute-values/"); 
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar atributos:", error);
    return [];
  }
};

export const createCategory = async (categoryData: FormData) => {
  try {
    const response = await api.post("/categories/", categoryData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    throw error;
  }
};

// Busca os nomes dos grupos (ex: Material, Tamanho)
export const getAttributeGroups = async () => {
  const response = await api.get("/product-attributes/");
  return response.data;
};

// Cria um novo valor para um grupo
export const createAttributeValue = async (data: { attribute: number, value: string }) => {
  const response = await api.post("/attribute-values/", data);
  return response.data;
};

// Cria um novo GRUPO de atributo (ex: "Cor", "Material")
export const createAttributeGroup = async (data: { name: string; slug: string }) => {
  const response = await api.post("/product-attributes/", data);
  return response.data;
};

// --- USUÁRIOS / CLIENTES ---
export const getUsers = async () => {
  try {
    const response = await api.get("/users/");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
};

// --- CONFIGURAÇÕES DO SITE ---
export const updateSiteSettings = async (formData: FormData) => {
  try {
    // Adicione a barra no final: /settings/1/ 
    const response = await api.patch("/settings/1/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    throw error;
  }
};

// --- FAQs ---
export const createFAQ = async (data: { question: string, answer: string }) => {
  const response = await api.post("/faqs/", data);
  return response.data;
};

export const deleteFAQ = async (id: number) => {
  await api.delete(`/faqs/${id}/`);
};