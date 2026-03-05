"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, Plus, X, Upload, Loader2, 
  Layers, Link as LinkIcon, Image as ImageIcon, Home 
} from "lucide-react";
import { createCategory, getCategories } from "@/services/api";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingCategories, setExistingCategories] = useState<any[]>([]);

  // --- ESTADOS DO FORMULÁRIO ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [showOnHome, setShowOnHome] = useState(false);
  
  // Imagem
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 1. Carrega as categorias existentes para o campo "Categoria Pai"
  useEffect(() => {
    async function loadCats() {
      try {
        const data = await getCategories();
        setExistingCategories(data || []);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }
    loadCats();
  }, []);

  // 2. Gerador automático de Slug (Link amigável)
  // Ex: "Anéis de Ouro" vira "aneis-de-ouro"
  useEffect(() => {
    if (name) {
      const generatedSlug = name
        .toLowerCase()
        .normalize("NFD") // Remove acentos
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9]+/g, "-") // Troca espaços por hifens
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    } else {
      setSlug("");
    }
  }, [name]);

  // 3. Lógica de Preview da Imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  // 4. ENVIO PARA O BACKEND
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    // Envia o slug explícito ou deixa o backend gerar (estamos enviando para garantir o que o usuário viu)
    formData.append("slug", slug); 
    formData.append("show_on_home", String(showOnHome));
    
    if (parentId) {
      formData.append("parent", parentId);
    }

    if (image) {
      formData.append("image", image);
    }

    try {
      await createCategory(formData);
      alert("Categoria criada com sucesso!");
      // Volta para a aba de categorias no Dashboard de Catálogo
      router.push("/admin/produtos"); 
    } catch (error) {
      alert("Erro ao criar categoria. Verifique se já não existe uma com esse nome.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 animate-fadeIn">
      
      {/* Voltar */}
      <Link href="/admin/produtos" className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors group font-medium w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para o Hub de Catálogo
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 dark:text-white">Nova Categoria</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Crie seções e organize a navegação da sua loja.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: INFORMAÇÕES BÁSICAS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-blue-600" /> Estrutura da Categoria
            </h3>
            
            {/* Nome da Categoria */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome da Categoria</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Anéis de Noivado" 
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>

            {/* Slug Gerado (Apenas visualização inteligente) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <LinkIcon className="w-3 h-3 text-gray-400" /> URL (Link do Site)
              </label>
              <div className="flex items-center w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-500 dark:text-gray-400 font-mono text-sm">
                <span>seusite.com/categoria/</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{slug || "..."}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>

            {/* Subcategoria de... (Parent) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pertence a qual categoria principal? (Opcional)</label>
              <p className="text-xs text-gray-500 mb-3">Selecione caso esta seja uma subcategoria. Ex: "Anéis de Noivado" fica dentro de "Anéis".</p>
              <select 
                value={parentId} 
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer font-medium"
              >
                <option value="">✨ Nenhuma (Categoria Principal)</option>
                {existingCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: IMAGEM E CONFIGURAÇÕES */}
        <div className="space-y-6">
          
          {/* Foto de Capa da Categoria */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" /> Foto de Capa
            </h3>
            <p className="text-xs text-gray-500">Aparecerá nos banners e coleções da loja principal.</p>
            
            {!preview ? (
              <label className="w-full h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 transition-all group">
                <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors mb-2" />
                <span className="text-xs text-gray-400 font-medium text-center px-4">Clique para fazer upload da foto</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            ) : (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group">
                <img src={preview} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={removeImage} 
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-8 h-8 text-white mb-2" />
                  <span className="text-white font-bold text-sm">Remover Foto</span>
                </button>
              </div>
            )}
          </div>

          {/* Mostrar na Home? */}
          <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
            <div className="mt-1">
              <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-blue-900 dark:text-blue-400 font-bold text-sm">Destaque na Home?</p>
                <input 
                  type="checkbox" 
                  checked={showOnHome} 
                  onChange={(e) => setShowOnHome(e.target.checked)} 
                  className="w-5 h-5 accent-blue-600 cursor-pointer rounded" 
                />
              </div>
              <p className="text-blue-700 dark:text-blue-600 text-xs leading-relaxed">Se ativado, esta categoria ganhará um bloco especial na página principal da loja (ex: "Coleção Alianças").</p>
            </div>
          </div>

          {/* BOTÃO SALVAR */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Categoria</>}
          </button>

        </div>
      </form>
    </div>
  );
}