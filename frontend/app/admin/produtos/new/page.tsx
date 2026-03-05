"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Plus, X, Upload, Loader2, 
  Tag, DollarSign, AlignLeft, Image as ImageIcon, CheckCircle2 
} from "lucide-react";
import { createProduct, getCategories, getAttributes } from "@/services/api";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);

  // --- ESTADO DO FORMULÁRIO ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [promotionalPrice, setPromotionalPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Carrega categorias e atributos globais ao abrir
  useEffect(() => {
    async function loadOptions() {
      try {
        const [cats, attrs] = await Promise.all([getCategories(), getAttributes()]);
        setCategories(cats || []);
        setAvailableAttributes(attrs || []);
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      }
    }
    loadOptions();
  }, []);

  // Lógica de Preview das Imagens
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const toggleAttribute = (id: number) => {
    setSelectedAttributes(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // ENVIO PARA O BACKEND
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("base_price", basePrice);
    if (promotionalPrice) formData.append("promotional_price", promotionalPrice);
    formData.append("category", category);
    formData.append("is_featured", String(isFeatured));
    formData.append("is_active", "true");

    // Envia a lista de IDs de atributos
    selectedAttributes.forEach(attrId => {
      formData.append("attributes", String(attrId));
    });

    // Envia os arquivos de imagem
    images.forEach(imageFile => {
      formData.append("uploaded_images", imageFile);
    });

    try {
      await createProduct(formData);
      alert("Joia cadastrada com sucesso!");
      router.push("/admin/produtos");
    } catch (error) {
      alert("Erro ao cadastrar produto. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-fadeIn">
      
      {/* Voltar */}
      <Link href="/admin/produtos" className="flex items-center text-gray-500 hover:text-emerald-600 mb-6 transition-colors group font-medium w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para o catálogo
      </Link>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white">Nova Joia</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Insira os detalhes técnicos e fotos da nova peça.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: INFORMAÇÕES BÁSICAS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dados Gerais */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <AlignLeft className="w-4 h-4 text-emerald-600" /> Informações Básicas
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Anel Solitário de Diamante Ouro 18k" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descrição Detalhada</label>
              <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o material, o tipo de pedra, a história da peça..." className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>
          </div>

          {/* Preços */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Precificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Preço Base (R$)</label>
                <input required type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Preço Promocional (Opcional)</label>
                <input type="number" step="0.01" value={promotionalPrice} onChange={(e) => setPromotionalPrice(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Atributos (TAMANHOS / MATERIAIS) */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-emerald-600" /> Atributos Disponíveis
            </h3>
            <p className="text-xs text-gray-500 mb-4 italic">Selecione todas as variações (tamanhos, metais) que este produto possui.</p>
            <div className="flex flex-wrap gap-2">
              {availableAttributes.map((attr) => (
                <button
                  key={attr.id}
                  type="button"
                  onClick={() => toggleAttribute(attr.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedAttributes.includes(attr.id)
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-500"
                  }`}
                >
                  {attr.attribute_name}: {attr.value}
                </button>
              ))}
              {availableAttributes.length === 0 && <p className="text-gray-400 text-sm italic">Nenhum atributo cadastrado no HUB ainda.</p>}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: IMAGENS E CATEGORIA */}
        <div className="space-y-6">
          
          {/* Categoria */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Categoria da Peça</label>
            <select 
              required
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer font-medium"
            >
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Fotos do Produto */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" /> Galeria de Fotos
            </h3>
            
            {/* Input de Upload Customizado */}
            <label className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all group">
              <Upload className="w-8 h-8 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs text-gray-400 mt-2 font-medium">Clique para subir fotos</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {/* Grid de Previews */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {previews.map((src, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                  <img src={src} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Destaque */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
            <div>
              <p className="text-emerald-900 dark:text-emerald-400 font-bold text-sm">Produto em Destaque?</p>
              <p className="text-emerald-700 dark:text-emerald-600 text-xs">Exibir no banner principal da Home.</p>
            </div>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-emerald-600 cursor-pointer" />
          </div>

          {/* BOTÃO SALVAR */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Joia no Catálogo</>}
          </button>

        </div>
      </form>
    </div>
  );
}