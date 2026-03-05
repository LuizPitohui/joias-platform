"use client";

import { useEffect, useState } from "react";
import { 
  Settings, Save, Store, Mail, ShieldCheck, 
  FileText, HelpCircle, Plus, Trash2, Loader2, Image as ImageIcon
} from "lucide-react";
import { getSiteSettings, updateSiteSettings, getFAQs, createFAQ, deleteFAQ } from "@/services/api";

export default function SettingsDashboardPage() {
  // 1. ESTADO DE MONTAGEM (Para evitar o erro de Hydration/Mounting)
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para as Configurações (Ajustados para bater com o Django)
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [privacyText, setPrivacyText] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // Previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  // Estados para FAQ
  const [faqs, setFaqs] = useState<any[]>([]);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);

  // 2. EFEITO DE MONTAGEM
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [settingsData, faqsData] = await Promise.all([
        getSiteSettings(),
        getFAQs()
      ]);

      // No Django Singleton, pegamos o objeto direto
      const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData;
      
      if (settings) {
        // AJUSTE: site_name (conforme seu models.py)
        setName(settings.site_name || "");
        setContactEmail(settings.contact_email || "");
        setPrivacyText(settings.privacy_policy || "");
        setLogoPreview(settings.logo || null);
        setCurrentPdfUrl(settings.privacy_policy_pdf || null);
      }
      setFaqs(faqsData || []);
    } catch (error) {
      console.error("Erro ao carregar configurações", error);
    } finally {
      setLoading(false);
    }
  }

  // SALVAR CONFIGURAÇÕES GERAIS
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      // AJUSTE: site_name
      formData.append("site_name", name);
      formData.append("contact_email", contactEmail);
      formData.append("privacy_policy", privacyText);
      
      if (logoFile) formData.append("logo", logoFile);
      if (pdfFile) formData.append("privacy_policy_pdf", pdfFile);

      await updateSiteSettings(formData);
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      alert("Erro ao salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ || !newFaqA) return;
    setFaqLoading(true);
    try {
      const addedFaq = await createFAQ({ question: newFaqQ, answer: newFaqA });
      setFaqs([...faqs, addedFaq]);
      setNewFaqQ("");
      setNewFaqA("");
    } catch (error) {
      alert("Erro ao adicionar pergunta.");
    } finally {
      setFaqLoading(false);
    }
  };

  const handleRemoveFaq = async (id: number) => {
    if (confirm("Remover esta pergunta?")) {
      try {
        await deleteFAQ(id);
        setFaqs(faqs.filter(f => f.id !== id));
      } catch (error) {
        alert("Erro ao remover.");
      }
    }
  };

  // 3. BLOQUEIO DE RENDERIZAÇÃO ATÉ MONTAR
  if (!mounted) return null;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-500" /> Configurações do Site
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Gerencie a identidade visual e as políticas da sua joalheria.</p>
        </div>
        <button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b pb-4">
              <Store className="w-5 h-5 text-indigo-500" /> Identidade da Loja
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nome Comercial</label>
                <input 
                  type="text" 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Logo Oficial</label>
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="w-20 h-20 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-8 h-8 text-gray-300" />}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setLogoFile(e.target.files[0]);
                          setLogoPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-gray-400 mt-2">Recomendado: PNG ou SVG com fundo transparente.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b pb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Jurídico e Contato
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">E-mail de Atendimento</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500"
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Texto da Política de Privacidade</label>
                <textarea 
                  rows={8}
                  value={privacyText} onChange={(e) => setPrivacyText(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 resize-none font-sans text-sm leading-relaxed"
                />
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <label className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-3">
                    <FileText className="w-4 h-4" /> Documento Oficial (PDF)
                </label>
                <input 
                  type="file" accept=".pdf"
                  onChange={(e) => e.target.files && setPdfFile(e.target.files[0])}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer w-full"
                />
                {currentPdfUrl && !pdfFile && (
                  <p className="mt-3 text-[11px] text-gray-500 flex items-center gap-1">
                      Arquivo atual: <a href={currentPdfUrl} target="_blank" className="text-emerald-600 font-bold underline">Visualizar PDF</a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b pb-4">
              <HelpCircle className="w-5 h-5 text-amber-500" /> FAQ
            </h2>
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {faqs.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">Nenhuma pergunta.</p>}
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 group relative">
                  <p className="font-bold text-xs text-gray-800 dark:text-gray-200 pr-6">{faq.question}</p>
                  <button 
                    onClick={() => handleRemoveFaq(faq.id)}
                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddFaq} className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30">
              <input 
                type="text" required placeholder="Pergunta..."
                value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full p-2 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none focus:border-amber-500"
              />
              <textarea 
                required rows={3} placeholder="Resposta..."
                value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full p-2 mb-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs outline-none focus:border-amber-500 resize-none"
              />
              <button 
                type="submit" disabled={faqLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-xs font-bold transition-all flex justify-center items-center"
              >
                {faqLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Plus className="w-3 h-3 mr-1"/> Adicionar</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}