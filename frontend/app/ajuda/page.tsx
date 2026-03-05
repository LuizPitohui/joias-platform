"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, getFAQs } from "@/services/api";
import { Mail, HelpCircle, ShieldCheck, FileText, Loader2, X } from "lucide-react";

export default function HelpPage() {
  const [settings, setSettings] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Estado para controlar o Modal do PDF
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadHelpData() {
      try {
        const [settingsData, faqsData] = await Promise.all([
          getSiteSettings(),
          getFAQs()
        ]);
        
        const settingsObj = Array.isArray(settingsData) ? settingsData[0] : settingsData;
        setSettings(settingsObj);
        setFaqs(faqsData || []);
      } catch (error) {
        console.error("Erro ao carregar dados de ajuda:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHelpData();
  }, []);

  const formatText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === "") return null;
      return (
        <p key={index} className="indent-8 text-justify mb-4 text-gray-700 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-700 mb-4" />
        <p className="text-gray-500 font-medium">Carregando central de ajuda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-4xl font-serif text-center text-gray-900 mb-12">Central de Ajuda</h1>

        {/* SESSÃO 1: FALE CONOSCO */}
        <section id="fale-conosco" className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 scroll-mt-24 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Mail className="w-6 h-6 text-emerald-700" />
            <h2 className="text-2xl font-serif text-gray-900">Fale Conosco</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Nossa equipe está pronta para te atender. Envie um e-mail para o endereço abaixo e retornaremos o mais breve possível.
          </p>
          <a 
            href={`mailto:${settings?.contact_email || "contato@loja.com"}`}
            className="bg-emerald-50 text-emerald-900 p-4 rounded-lg inline-block font-bold hover:bg-emerald-100 transition-colors"
          >
            {settings?.contact_email || "contato@suajoalheria.com.br"}
          </a>
        </section>

        {/* SESSÃO 2: POLÍTICA DE PRIVACIDADE */}
        <section id="privacidade" className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 scroll-mt-24 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h2 className="text-2xl font-serif text-gray-900">Política de Privacidade</h2>
            </div>
            
            {/* BOTÃO QUE ABRE O MODAL */}
            {settings?.privacy_policy_pdf && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-gray-100 hover:bg-emerald-700 hover:text-white px-4 py-2 rounded-xl transition-all"
              >
                <FileText className="w-4 h-4" /> Visualizar PDF
              </button>
            )}
          </div>
          <div className="prose prose-emerald max-w-none">
            {settings?.privacy_policy ? (
              formatText(settings.privacy_policy)
            ) : (
              <p className="text-gray-500 italic">Nossa política de privacidade está sendo atualizada para melhor lhe atender.</p>
            )}
          </div>
        </section>

        {/* SESSÃO 3: PERGUNTAS FREQUENTES */}
        <section id="faq" className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 scroll-mt-24 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <HelpCircle className="w-6 h-6 text-emerald-700" />
            <h2 className="text-2xl font-serif text-gray-900">Perguntas Frequentes (FAQ)</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <div key={faq.id} className="bg-gray-50 p-6 rounded-xl border border-transparent hover:border-emerald-100 transition-all">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <div className="text-gray-700 leading-relaxed text-justify">
                    {formatText(faq.answer)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-10">Nenhuma pergunta cadastrada no momento.</p>
            )}
          </div>
        </section>
      </div>

      {/* MODAL DO VISUALIZADOR DE PDF */}
      {isModalOpen && settings?.privacy_policy_pdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header do Modal */}
            <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 px-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-gray-900 dark:text-white">Documento Oficial de Privacidade</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Iframe para leitura do PDF */}
            <div className="flex-1 bg-gray-200">
              <iframe 
                src={`${settings.privacy_policy_pdf}#toolbar=0`} 
                className="w-full h-full border-none"
                title="Visualizador de PDF"
              />
            </div>
            
            {/* Footer do Modal */}
            <div className="p-4 border-t dark:border-gray-800 text-center">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-sm font-bold text-emerald-700 hover:underline uppercase tracking-widest"
              >
                Fechar Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}