"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, AlertCircle } from "lucide-react";
import { getProducts, deleteProduct } from "@/services/api";

interface Product {
  id: number;
  name: string;
  base_price: string;
  category_name: string; // O serializer já manda esse campo
  images: { image: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Carrega produtos ao abrir
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getProducts();
    // Ordena pelo ID decrescente (mais novos primeiro)
    setProducts(data.sort((a: Product, b: Product) => b.id - a.id));
    setLoading(false);
  }

  // Função de Excluir
  async function handleDelete(id: number) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduct(id);
        // Remove da lista visualmente sem precisar recarregar tudo
        setProducts(products.filter(p => p.id !== id));
        alert("Produto excluído com sucesso!");
      } catch (error) {
        alert("Erro ao excluir. Verifique se você está logado.");
      }
    }
  }

  // Filtro simples no front (para listas pequenas/médias é instantâneo)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-800">Produtos</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie o catálogo da loja</p>
        </div>
        
        <Link 
          href="/admin/products/new" 
          className="bg-emerald-900 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-800 transition shadow-lg"
        >
          <Plus className="w-5 h-5" /> Novo Produto
        </Link>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar por nome..." 
          className="flex-1 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela de Listagem */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando estoque...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center text-gray-400">
            <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
            <p>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Imagem</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Preço Base</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {product.images[0] ? (
                          <img src={product.images[0].image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem foto</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                        {product.category_name || "Geral"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-700 font-bold">R$ {product.base_price}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/products/edit/${product.id}`} // Vamos criar isso depois
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}