"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // useParams para pegar o ID
import Link from "next/link";
import { ArrowLeft, Save, Upload, X, Trash } from "lucide-react";
import { getCategories, getProductById, updateProduct } from "@/services/api";
import { deleteProductImage } from "@/services/api";

export default function EditProductPage() {
const [existingImages, setExistingImages] = useState<any[]>([]);
  const router = useRouter();
  const params = useParams();
  const productId = params.id; // Pega o ID da URL

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  // Imagens
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Carrega os dados do produto e categorias ao abrir
  useEffect(() => {
    async function loadData() {
      try {
        const [catsData, productData] = await Promise.all([
          getCategories(),
          getProductById(productId as string)
        ]);
        
        setCategories(catsData);

        // Preenche o formulário com os dados que vieram do banco
        if (productData) {
          setName(productData.name);
          setDescription(productData.description || "");
          setPrice(productData.base_price);
          setPromoPrice(productData.promotional_price || "");
          setCategoryId(productData.category || "");
          
          // Se tiver imagem salva, mostra ela
        if (productData.images && productData.images.length > 0) {
            setExistingImages(productData.images);
            setCurrentImageUrl(productData.images[0].image);
          }
        }
      } catch (error) {
        alert("Erro ao carregar produto.");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  // Preview da NOVA imagem (se o usuário selecionar uma)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleDeleteImage = async (imageId: number) => {
    // Pergunta se o usuário tem certeza
    if (confirm("Tem certeza que deseja remover esta foto?")) {
      try {
        // Chama a API para deletar no servidor
        await deleteProductImage(imageId);
        
        // Atualiza a tela removendo a imagem da lista visualmente
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      } catch (error) {
        console.error(error);
        alert("Erro ao deletar imagem. Verifique se você está logado.");
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("base_price", price);
      
      if (promoPrice) formData.append("promotional_price", promoPrice);
      if (categoryId) formData.append("category", categoryId);

      // Só envia imagem se o usuário tiver selecionado uma NOVA
      if (selectedImage) {
        formData.append("uploaded_images", selectedImage); 
      }

      await updateProduct(productId as string, formData);
      
      alert("Produto atualizado com sucesso!");
      router.push("/admin/products");
    } catch (error) {
      alert("Erro ao atualizar. Verifique os campos.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Carregando dados...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-serif text-gray-800">Editar Produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        
        {/* Nome e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Nome</label>
            <input 
              required
              type="text" 
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Categoria</label>
            <select 
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Preço Base (R$)</label>
            <input 
              required
              type="number" step="0.01"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Preço Promocional</label>
            <input 
              type="number" step="0.01"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={promoPrice}
              onChange={e => setPromoPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Descrição</label>
          <textarea 
            required
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Imagem */}
        <div className="space-y-2">
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">Galeria de Imagens</label>
                
                {/* 1. Lista de Imagens Existentes (Com botão de lixeira) */}
                {existingImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {existingImages.map((img) => (
                    <div key={img.id} className="relative group border border-gray-200 rounded-lg overflow-hidden aspect-square bg-gray-50">
                        <img src={img.image} className="w-full h-full object-cover" />
                        
                        {/* Botão de Excluir (aparece ao passar o mouse) */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                            type="button" // Importante ser type="button" para não submeter o form
                            onClick={() => handleDeleteImage(img.id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition cursor-pointer"
                            title="Remover foto"
                        >
                            <Trash className="w-5 h-5" />
                        </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {/* 2. Área de Upload de NOVAS Imagens */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition relative min-h-[120px] flex flex-col items-center justify-center">
                    {previewUrl ? (
                        <div className="relative w-32 h-32">
                            <img src={previewUrl} className="w-full h-full object-cover rounded-lg shadow-sm" />
                            <button 
                                type="button"
                                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                                title="Cancelar upload"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 px-2 py-1 rounded-full">Nova imagem selecionada</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm font-medium">Adicionar nova foto à galeria</p>
                            <p className="text-xs text-gray-400 mt-1">(Será adicionada junto com as atuais)</p>
                        </>
                    )}
                    
                    {/* Input escondido se já tiver preview */}
                    {!previewUrl && (
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                    />
                    )}
                </div>
            </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-emerald-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-800 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? "Atualizando..." : <><Save className="w-5 h-5" /> Salvar Alterações</>}
          </button>
        </div>

      </form>
    </div>
  );
}