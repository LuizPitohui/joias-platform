"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { name: "Visão Geral", icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Produtos", icon: Package, href: "/admin/products" },
  { name: "Pedidos", icon: ShoppingBag, href: "/admin/orders" }, // Futuro
  { name: "Clientes", icon: Users, href: "/admin/customers" },   // Futuro
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-emerald-900 text-white min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-8 border-b border-emerald-800">
        <h1 className="text-2xl font-serif font-bold tracking-widest">ADMIN</h1>
        <p className="text-xs text-emerald-300 mt-1">Gestão da Joalheria</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? "bg-white text-emerald-900 font-bold shadow-lg" : "text-emerald-100 hover:bg-emerald-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-red-300 hover:text-red-100 w-full transition"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>
    </aside>
  );
}