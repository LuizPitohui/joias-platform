"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, Loader2, Ruler, 
  Info, CheckCircle2, AlertTriangle, Plus, X 
} from "lucide-react";
import { getAttributeGroups, createAttributeValue, createAttributeGroup } from "@/services/api";

export default function NewAttributePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);

  // --- ESTADO DO FORMULÁRIO PRINCIPAL ---
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [value, setValue] = useState("");

  // --- ESTADOS DE CRIAÇÃO DO "NOVO TIPO" (Inline) ---
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroupLoading, setCreatingGroupLoading] = useState(false);

  // 1. Carrega os grupos existentes
  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setFetchingGroups(true);
    try {
      const data = await getAttributeGroups();
      setGroups(data || []);
    } catch (error) {
      console.error("Erro ao carregar grupos de atributos:", error);
    } finally {
      setFetchingGroups(false);
    }
  }

  // 2. FUNÇÃO: Criar um Novo Tipo na mesma tela
  async function handleCreateNewGroup() {
    if (!newGroupName.trim()) return;
    setCreatingGroupLoading(true);

    try {
      // Gera o slug automático (ex: "Tipo de Pedra" -> "tipo-de-pedra")
      const slug = newGroupName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const newGroup = await createAttributeGroup({ name: newGroupName, slug });
      
      // Recarrega a lista do banco de dados
      const data = await getAttributeGroups();
      setGroups(data || []);
      
      // Seleciona o grupo que acabou de ser criado e fecha a janelinha
      setSelectedGroupId(newGroup.id.toString());
      setIsCreatingGroup(false);
      setNewGroupName("");
      
    } catch (error) {
      alert("Erro ao criar tipo. Pode ser que já exista um com esse nome.");
      console.error(error);
    } finally {
      setCreatingGroupLoading(false);
    }
  }

  // 3. ENVIO DO FORMULÁRIO PRINCIPAL
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGroupId) {
      alert("Por favor, selecione ou crie o tipo do atributo (ex: Material).");
      return;
    }

    setLoading(true);

    try {
      await createAttributeValue({
        attribute: Number(selectedGroupId),
        value: value
      });
      
      alert("Opção cadastrada com sucesso!");
      router.push("/admin/produtos"); 
    } catch (error) {
      alert("Erro ao cadastrar. Verifique se este valor já não existe para este atributo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-20 animate-fadeIn">
      
      <Link href="/admin/products" className="flex items-center text-gray-500 hover:text-amber-600 mb-6 transition-colors group font-medium w-fit">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para o Hub de Catálogo
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900 dark:text-white">Novo Atributo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Crie opções de materiais, tamanhos ou purezas para suas joias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Definição Técnica</h3>
            </div>

            {/* SEÇÃO INTELIGENTE: Seleção do Grupo (Tipo) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Qual o tipo do atributo?</label>
              
              {!isCreatingGroup ? (
                // MODO 1: DROPDOWN NORMAL
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select 
                      required
                      value={selectedGroupId} 
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      disabled={fetchingGroups}
                      className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer font-bold"
                    >
                      <option value="">{fetchingGroups ? "Carregando tipos..." : "Selecione o tipo (ex: Material, Tamanho)..."}</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                    
                    {/* Botão de Adicionar Novo Tipo */}
                    <button 
                      type="button"
                      onClick={() => setIsCreatingGroup(true)}
                      className="px-4 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors font-bold flex items-center gap-1"
                      title="Criar novo Tipo (ex: Tipo de Pedra)"
                    >
                      <Plus className="w-5 h-5" /> Novo
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Se o tipo que você precisa não estiver na lista, clique em "Novo".
                  </p>
                </div>
              ) : (
                // MODO 2: CRIANDO NOVO TIPO NA HORA
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-3 animate-fadeIn">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="Ex: Pureza, Cor, Coleção..."
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleCreateNewGroup(); } }}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleCreateNewGroup}
                    disabled={creatingGroupLoading || !newGroupName}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    {creatingGroupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsCreatingGroup(false); setNewGroupName(""); }}
                    className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Valor do Atributo */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valor da Opção</label>
              <input 
                required 
                type="text" 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder="Ex: Ouro 18k, Aro 16, Prata 925..." 
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all text-lg font-medium" 
              />
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-500 leading-relaxed">
                  <strong>Dica de Organização:</strong> Mantenha um padrão de escrita. Se usar "Ouro 18k", evite criar outro como "Ouro 18 K". Isso ajuda seu cliente a filtrar os produtos no site com mais precisão.
                </p>
              </div>
            </div>

            {/* BOTÃO SALVAR PRINCIPAL */}
            <button 
              type="submit" 
              disabled={loading || fetchingGroups || isCreatingGroup}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Cadastrar Opção no Catálogo</>}
            </button>
          </div>

        </form>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
           <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
             <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Onde isso aparece?
           </h4>
           <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-3">
             <li className="flex gap-2">
               <span className="text-amber-600 font-bold">•</span>
               <span>Ficará disponível como opção de marcação na tela de <strong>Novo Produto</strong>.</span>
             </li>
             <li className="flex gap-2">
               <span className="text-amber-600 font-bold">•</span>
               <span>Aparecerá como botão de escolha para o cliente no <strong>Carrinho de Compras</strong>.</span>
             </li>
             <li className="flex gap-2">
               <span className="text-amber-600 font-bold">•</span>
               <span>Será usado pelos filtros de busca da loja para encontrar joias específicas.</span>
             </li>
           </ul>
        </div>

      </div>
    </div>
  );
}