"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, Upload, X, Trash2, Loader2, 
  AlignLeft, DollarSign, Tag, Image as ImageIcon 
} from "lucide-react";
import { getCategories, getAttributes, getProductById, updateProduct, deleteProductImage } from "@/services/api";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dicionários globais
  const [categories, setCategories] = useState<any[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
  
  // Imagens
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // 1. Carrega os dados do produto, categorias e atributos
  useEffect(() => {
    async function loadData() {
      try {
        const [catsData, attrsData, productData] = await Promise.all([
          getCategories(),
          getAttributes(),
          getProductById(productId)
        ]);
        
        setCategories(catsData || []);
        setAvailableAttributes(attrsData || []);

        if (productData) {
          setName(productData.name);
          setDescription(productData.description || "");
          setPrice(productData.base_price);
          setPromoPrice(productData.promotional_price || "");
          setCategoryId(productData.category || "");
          setIsFeatured(productData.is_featured || false);
          
          // Mapeia os atributos que o produto já tem marcados
          if (productData.attributes) {
            setSelectedAttributes(productData.attributes.map((attr: any) => attr.id || attr.attribute_id || attr));
          }
          
          if (productData.images && productData.images.length > 0) {
            setExistingImages(productData.images);
          }
        }
      } catch (error) {
        alert("Erro ao carregar produto.");
        router.push("/admin/produtos");
      } finally {
        setLoading(false);
      }
    }
    if (productId) loadData();
  }, [productId, router]);

  // --- LÓGICA DE ATRIBUTOS ---
  const toggleAttribute = (id: number) => {
    setSelectedAttributes(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // --- LÓGICA DE IMAGENS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (confirm("Tem certeza que deseja remover esta foto permanentemente do catálogo?")) {
      try {
        await deleteProductImage(imageId);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      } catch (error) {
        console.error(error);
        alert("Erro ao deletar imagem.");
      }
    }
  };

  // --- ENVIO PARA A API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("base_price", price);
      formData.append("is_featured", String(isFeatured));
      
      if (promoPrice) formData.append("promotional_price", promoPrice);
      if (categoryId) formData.append("category", categoryId);

      // Envia a lista atualizada de IDs de atributos
      // Importante: No Django, enviar um array vazio pode exigir um tratamento específico no serializer se quiser limpar tudo
      selectedAttributes.forEach(attrId => {
        formData.append("attributes", String(attrId));
      });

      // Envia as novas fotos
      newImages.forEach(imageFile => {
        formData.append("uploaded_images", imageFile);
      });

      await updateProduct(productId, formData);
      
      alert("Joia atualizada com sucesso!");
      router.push("/admin/produtos");
    } catch (error) {
      alert("Erro ao atualizar. Verifique os campos ou sua conexão.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-fadeIn">
      
      {/* Voltar */}
      <Link href="/admin/produtos" className="flex items-center text-gray-500 hover:text-emerald-600 mb-6 transition-colors group font-medium w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para o catálogo
      </Link>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white">Editar Joia</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Atualize os detalhes técnicos e fotos da peça.</p>
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
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descrição Detalhada</label>
              <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
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
                <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Preço Promocional (Opcional)</label>
                <input type="number" step="0.01" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Atributos (TAMANHOS / MATERIAIS) */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-emerald-600" /> Atributos da Peça
            </h3>
            <p className="text-xs text-gray-500 mb-4 italic">Altere as variações disponíveis para esta joia.</p>
            <div className="flex flex-wrap gap-2">
              {availableAttributes.map((attr) => {
                const isSelected = selectedAttributes.includes(attr.id);
                return (
                  <button
                    key={attr.id}
                    type="button"
                    onClick={() => toggleAttribute(attr.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-500"
                    }`}
                  >
                    {attr.attribute_name || attr.name}: {attr.value}
                  </button>
                );
              })}
              {availableAttributes.length === 0 && <p className="text-gray-400 text-sm italic">Nenhum atributo cadastrado no sistema.</p>}
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
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer font-medium"
            >
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Destaque */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
            <div>
              <p className="text-emerald-900 dark:text-emerald-400 font-bold text-sm">Produto em Destaque?</p>
              <p className="text-emerald-700 dark:text-emerald-600 text-xs">Exibir no banner principal da Home.</p>
            </div>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-emerald-600 cursor-pointer" />
          </div>

          {/* Fotos do Produto */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" /> Galeria de Fotos
            </h3>
            
            {/* 1. Imagens Existentes */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <img src={img.image} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Deletar permanentemente"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Upload de Novas Imagens */}
            <label className="w-full h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all group">
              <Upload className="w-6 h-6 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs text-gray-400 mt-2 font-medium">Adicionar novas fotos</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {/* 3. Previews das Novas */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previewUrls.map((src, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-sm border-2">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTÃO SALVAR */}
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
          </button>

        </div>
      </form>
    </div>
  );
}