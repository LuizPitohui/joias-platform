"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// CORREÇÃO: Importando os ícones que faltavam
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Esconde o Footer se estiver no painel Admin
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Coluna 1: Sobre */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif tracking-widest text-emerald-400">JOALHERIA</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Criando momentos inesquecíveis através de joias artesanais com design exclusivo e materiais nobres desde 1990.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition bg-gray-800 p-2 rounded-full hover:bg-emerald-900">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition bg-gray-800 p-2 rounded-full hover:bg-emerald-900">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition bg-gray-800 p-2 rounded-full hover:bg-emerald-900">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h4 className="text-lg font-medium mb-6 text-white">Navegação</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-emerald-400 transition">Início</Link></li>
              <li><Link href="/categoria/aneis" className="hover:text-emerald-400 transition">Anéis</Link></li>
              <li><Link href="/categoria/colares" className="hover:text-emerald-400 transition">Colares</Link></li>
              <li><Link href="/sobre" className="hover:text-emerald-400 transition">Nossa História</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div>
            <h4 className="text-lg font-medium mb-6 text-white">Ajuda</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/contato" className="hover:text-emerald-400 transition">Fale Conosco</Link></li>
              <li><Link href="/trocas" className="hover:text-emerald-400 transition">Trocas e Devoluções</Link></li>
              <li><Link href="/privacidade" className="hover:text-emerald-400 transition">Política de Privacidade</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-400 transition">Perguntas Frequentes</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div>
            <h4 className="text-lg font-medium mb-6 text-white">Contato</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-emerald-500 shrink-0" />
                <span>Av. Paulista, 1000 - Bela Vista<br />São Paulo - SP</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-emerald-500 shrink-0" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-emerald-500 shrink-0" />
                <span>contato@joalheria.com.br</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Joalheria Exclusiva. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}