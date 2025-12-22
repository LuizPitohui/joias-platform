import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Fonte bonita padrão
import "./globals.css";
import Navbar from "@/components/Navbar"; // <--- IMPORTANTE

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Joalheria Exclusiva",
  description: "Loja de joias personalizadas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Navbar />  {/* <--- AQUI ESTÁ ELA! Fixa no topo */}
        {children}  {/* Aqui entra o conteúdo da página (Home, Produto, etc) */}
      </body>
    </html>
  );
}