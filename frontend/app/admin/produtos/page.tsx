"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, Pencil, Trash2, Search, PackageX, 
  Loader2, Image as ImageIcon, Filter, ChevronLeft, ChevronRight,
  Package, Tags, Ruler, Layers
} from "lucide-react";
import { getProducts, deleteProduct, getCategories, getAttributes } from "@/services/api";

interface Product {
  id: number;
  name: string;
  base_price: string;
  category_name: string; 
  images: { image: string }[];
}

export default function CatalogDashboardPage() {
  // --- ESTADOS GERAIS ---
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'attributes'>('products');
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DOS DADOS ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  
  // --- ESTADOS DE PRODUTOS (Busca, Paginação, Exclusão) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- ESTADOS DE ATRIBUTOS (Busca e Paginação) ---
  const [attrSearchTerm, setAttrSearchTerm] = useState("");
  const [attrCurrentPage, setAttrCurrentPage] = useState(1);
  const attrItemsPerPage = 10;

  // Carrega todos os dados do HUB ao abrir a página
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      // Carrega tudo em paralelo para ser mais rápido
      const [productsData, categoriesData, attributesData] = await Promise.all([
        getProducts(),
        getCategories(),
        getAttributes()
      ]);
      
      setProducts(productsData?.sort((a: any, b: any) => b.id - a.id) || []);
      setCategories(categoriesData || []);
      setAttributes(attributesData || []);
    } catch (error) {
      console.error("Erro ao carregar o HUB de Catálogo:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÕES DE PRODUTOS ---
  async function handleDeleteProduct(id: number) {
    if (confirm("Tem certeza que deseja excluir esta joia do catálogo?")) {
      setDeletingId(id);
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert("Erro ao excluir.");
      } finally {
        setDeletingId(null);
      }
    }
  }

  // Lógica de Filtros (Produtos)
  const uniqueCategories = ["Todas", ...Array.from(new Set(products.map(p => p.category_name || "Sem Categoria")))];
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Todas" || (p.category_name || "Sem Categoria") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Lógica de Paginação (Produtos)
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, itemsPerPage]);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);


  // --- LÓGICA DE FILTROS E PAGINAÇÃO (ATRIBUTOS) ---
  useEffect(() => { setAttrCurrentPage(1); }, [attrSearchTerm]);
  
  const filteredAttributes = attributes.filter(attr => {
    const search = attrSearchTerm.toLowerCase();
    const nameMatch = (attr.attribute_name || attr.name || "").toLowerCase().includes(search);
    const valueMatch = (attr.value || "").toLowerCase().includes(search);
    return nameMatch || valueMatch;
  });

  const attrTotalPages = Math.ceil(filteredAttributes.length / attrItemsPerPage);
  const attrStartIndex = (attrCurrentPage - 1) * attrItemsPerPage;
  const paginatedAttributes = filteredAttributes.slice(attrStartIndex, attrStartIndex + attrItemsPerPage);


  // --- RENDERIZAÇÃO DAS ABAS ---
  return (
    <div className="w-full animate-fadeIn transition-colors duration-300 pb-20">
      
      {/* CABEÇALHO DO HUB */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 dark:text-white">Hub de Catálogo</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie suas joias, categorias estruturais e atributos (tamanhos, metais).</p>
      </div>

      {/* CARDS DE RESUMO (Estatísticas Rápidas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-colors">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total de Joias</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{products.length}</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-colors">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Categorias</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{categories.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-colors">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Atributos</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{attributes.length}</h3>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DAS ABAS */}
      <div className="flex space-x-1 bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-xl mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Package className="w-4 h-4" /> Joias (Produtos)
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Layers className="w-4 h-4" /> Categorias
        </button>
        <button 
          onClick={() => setActiveTab('attributes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'attributes' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Ruler className="w-4 h-4" /> Atributos (Tam/Material)
        </button>
      </div>

      {/* ========================================== */}
      {/* ABA: PRODUTOS                              */}
      {/* ========================================== */}
      {activeTab === 'products' && (
        <div className="animate-fadeIn">
          {/* Ações e Filtros de Produtos */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-2 flex-1 transition-colors">
              <div className="flex items-center gap-2 w-full px-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-2 md:pb-0">
                <Search className="w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Buscar joia..." className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white py-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto px-3 shrink-0">
                <Filter className="w-4 h-4 text-gray-400" />
                <select className="bg-transparent border-none text-gray-700 dark:text-gray-200 outline-none cursor-pointer py-2 w-full md:w-48" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <Link href="/admin/produtos/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shrink-0 transition-colors">
              <Plus className="w-5 h-5" /> Nova Joia
            </Link>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
            {loading ? (
              <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
            ) : paginatedProducts.length === 0 ? (
              <div className="p-16 text-center text-gray-400"><PackageX className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Nenhuma joia encontrada.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100 dark:border-gray-800">
                    <tr><th className="px-6 py-4">Joia</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4">Preço</th><th className="px-6 py-4 text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="px-6 py-4 flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {product.images?.[0]?.image ? <img src={product.images[0].image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{product.name}</span>
                        </td>
                        <td className="px-6 py-4"><span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-bold">{product.category_name || "Sem Categoria"}</span></td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">R$ {Number(product.base_price).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/produtos/edit/${product.id}`} className="inline-block p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors mr-1"><Pencil className="w-4 h-4" /></Link>
                          <button onClick={() => handleDeleteProduct(product.id)} disabled={deletingId === product.id} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            {deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Paginação de Produtos */}
            {!loading && paginatedProducts.length > 0 && (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">Página {currentPage} de {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ABA: CATEGORIAS                              */}
      {/* ========================================== */}
      {activeTab === 'categories' && (
        <div className="animate-fadeIn">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><Layers className="w-5 h-5 text-blue-500"/> Árvore de Categorias</h2>
            <Link href="/admin/categorias/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Nova Categoria
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                {categories.map((cat, i) => (
                  <div key={i} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <span className="font-bold text-gray-700 dark:text-gray-200">{cat.name}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded">{cat.slug}</span>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-gray-500 dark:text-gray-400 py-10">As categorias aparecerão aqui quando a API estiver conectada e houver dados.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ABA: ATRIBUTOS                               */}
      {/* ========================================== */}
      {activeTab === 'attributes' && (
        <div className="animate-fadeIn">
          
          {/* Ações e Filtros de Atributos */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <Ruler className="w-5 h-5 text-amber-500"/> Gestão de Atributos
               </h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
               {/* Barra de Pesquisa de Atributos */}
               <div className="bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-2 w-full md:w-64 transition-colors">
                  <div className="flex items-center gap-2 w-full px-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar atributo..." 
                      className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white py-1" 
                      value={attrSearchTerm} 
                      onChange={(e) => setAttrSearchTerm(e.target.value)} 
                    />
                  </div>
               </div>
               
               <Link href="/admin/atributos/new" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shrink-0">
                 <Plus className="w-4 h-4" /> Novo Atributo
               </Link>
            </div>
          </div>
          
          {/* Lista de Atributos */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
             {attributes.length > 0 ? (
                <>
                  {paginatedAttributes.length > 0 ? (
                    <div className="space-y-4 text-left">
                      {paginatedAttributes.map((attr, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:border-amber-200 dark:hover:border-amber-900 transition-colors">
                           <div className="flex flex-col">
                             <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">
                               {attr.attribute_name || attr.name || "Tipo"}
                             </span>
                             <span className="font-bold text-gray-900 dark:text-white text-lg">
                               {attr.value}
                             </span>
                           </div>
                           <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-bold">
                             ID: {attr.id}
                           </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-gray-500 dark:text-gray-400">
                      <p>Nenhum atributo encontrado para "{attrSearchTerm}".</p>
                    </div>
                  )}

                  {/* Paginação de Atributos */}
                  {paginatedAttributes.length > 0 && (
                    <div className="mt-6 pt-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Página {attrCurrentPage} de {attrTotalPages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setAttrCurrentPage(p => Math.max(p - 1, 1))} disabled={attrCurrentPage === 1} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => setAttrCurrentPage(p => Math.min(p + 1, attrTotalPages))} disabled={attrCurrentPage === attrTotalPages || attrTotalPages === 0} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </>
             ) : (
                <div className="py-10 text-gray-500 dark:text-gray-400">
                  <p>Aqui você criará opções como "Tamanho 18", "Tamanho 20", "Ouro Branco", etc.</p>
                  <p className="text-sm mt-2 opacity-70">A lista carregará automaticamente assim que criarmos as opções.</p>
                </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
}