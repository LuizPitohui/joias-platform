import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  try {
    const response = await api.get('/products/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

// Adicione esta nova função:
export const getCategories = async () => {
  try {
    const response = await api.get('/categories/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

// Função para buscar um produto pelo slug
export const getProductBySlug = async (slug: string) => {
  try {
    // O Django espera algo como /api/products/anel-de-ouro/
    const response = await api.get(`/products/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto ${slug}:`, error);
    return null;
  }
};