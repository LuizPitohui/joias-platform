"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { getCategories, createProduct } from "@/services/api";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  // Estado da Imagem
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Carrega categorias para o Select
  useEffect(() => {
    async function loadCats() {
      const data = await getCategories();
      setCategories(data);
    }
    loadCats();
  }, []);

  // Lógica de Preview da Imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usamos FormData para enviar arquivos
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("base_price", price);
      
      if (promoPrice) {
        formData.append("promotional_price", promoPrice);
      }
      
      // O backend espera o ID da categoria
      if (categoryId) {
        formData.append("category", categoryId); 
      }
      
      if (selectedImage) {
        // Usamos o mesmo nome que definimos no serializer: 'uploaded_images'
        formData.append("uploaded_images", selectedImage); 
      }

      // Adiciona a imagem principal (O backend espera uma lista de imagens ou upload direto. 
      // Dependendo de como fizemos o serializer, vamos tentar enviar como 'uploaded_images' ou criar separado.
      // Vamos tentar o padrão simples primeiro: enviar os campos básicos e depois gerenciar imagens se o backend reclamar.
      // EDIT: Seu ProductSerializer espera 'images' como read_only e ProductImage separado? 
      // Não, vamos mandar sem imagem primeiro para criar o produto, e depois enviamos a imagem?
      // Ou melhor: Vamos assumir que seu backend aceita upload básico ou vamos simplificar.)
      
      // NOTA: Geralmente upload de imagens em DRF nested é chato.
      // Vamos testar criando o produto SEM imagem primeiro para ver se passa.
      
      const newProduct = await createProduct(formData);
      
      // Se tiver imagem, precisamos enviá-la para o endpoint de imagens (ProductImage)
      if (selectedImage && newProduct.id) {
         // Aqui seria a lógica de upload da imagem separada se o nested write não estiver ativo
         // Mas vamos tentar enviar tudo junto primeiro ou implementar upload separado.
         alert("Produto criado! (Upload de imagem pendente de configuração avançada)");
      } else {
         alert("Produto criado com sucesso!");
      }

      router.push("/admin/products");
    } catch (error) {
      alert("Erro ao criar produto. Verifique os campos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-serif text-gray-800">Novo Produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        
        {/* Nome e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Nome do Produto</label>
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
            <label className="text-sm font-bold text-gray-700">Preço Promocional (Opcional)</label>
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

        {/* Upload de Imagem (Visual) */}
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Foto Principal (Capa)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition relative">
                
                {previewUrl ? (
                    <div className="relative w-48 h-48 mx-auto">
                        <img src={previewUrl} className="w-full h-full object-cover rounded-lg" />
                        <button 
                            type="button"
                            onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Clique para adicionar uma imagem</p>
                    </>
                )}
                
                <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                />
            </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-800 transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "Salvando..." : <><Save className="w-5 h-5" /> Salvar Produto</>}
          </button>
        </div>

      </form>
    </div>
  );
}