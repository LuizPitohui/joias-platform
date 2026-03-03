"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, getFAQs } from "@/services/api";
import { Mail, HelpCircle, ShieldCheck } from "lucide-react";

export default function HelpPage() {
  const [settings, setSettings] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    getSiteSettings().then(setSettings);
    getFAQs().then(setFaqs);
  }, []);

  // Função para formatar o texto com parágrafos recuados e justificados
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

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-4xl font-serif text-center text-gray-900 mb-12">Central de Ajuda</h1>

        {/* SESSÃO 1: FALE CONOSCO */}
        <section id="fale-conosco" className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Mail className="w-6 h-6 text-emerald-700" />
            <h2 className="text-2xl font-serif text-gray-900">Fale Conosco</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Nossa equipe está pronta para te atender. Envie um e-mail para o endereço abaixo e retornaremos o mais breve possível.
          </p>
          <div className="bg-emerald-50 text-emerald-900 p-4 rounded-lg inline-block font-medium">
            {settings?.contact_email || "contato@suajoalheria.com.br"}
          </div>
        </section>

        {/* SESSÃO 2: POLÍTICA DE PRIVACIDADE */}
        <section id="privacidade" className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <h2 className="text-2xl font-serif text-gray-900">Política de Privacidade</h2>
          </div>
          <div className="prose prose-emerald max-w-none">
            {settings?.privacy_policy ? (
              formatText(settings.privacy_policy)
            ) : (
              <p className="text-gray-500 italic">Política de privacidade em atualização.</p>
            )}
          </div>
        </section>

        {/* SESSÃO 3: PERGUNTAS FREQUENTES */}
        <section id="faq" className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <HelpCircle className="w-6 h-6 text-emerald-700" />
            <h2 className="text-2xl font-serif text-gray-900">Perguntas Frequentes (FAQ)</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <div key={faq.id} className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <div className="text-gray-700 leading-relaxed text-justify">
                    {/* Reutiliza a formatação para as respostas do FAQ também ficarem bonitas */}
                    {formatText(faq.answer)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Nenhuma pergunta cadastrada no momento.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}