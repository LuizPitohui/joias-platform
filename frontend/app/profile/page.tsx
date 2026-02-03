"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // <--- Import importante
import { useAuth } from "@/context/AuthContext";
import { 
  getAddresses, 
  createAddress, 
  deleteAddress, 
  getOrders 
} from "@/services/api";
import { 
  User, MapPin, LogOut, Plus, Trash2, Loader2, 
  ShoppingBag, Package, Clock, CheckCircle, XCircle 
} from "lucide-react";

// Tipagem do Pedido
interface OrderItem {
  id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number | string;
}

interface Order {
  id: number;
  status: string;
  total: string | number;
  created_at: string;
  items: OrderItem[];
}

// Mapa de Status
const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  paid: { label: "Pago", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: Package },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-800", icon: CheckCircle },
  canceled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
};

// --- COMPONENTE INTERNO (Lógica do Perfil) ---
function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // Ler a URL

  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders'>('info');
  
  // Estados de Dados
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Estados de Loading
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Novo Endereço
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "", zip_code: "", street: "", number: "", 
    neighborhood: "", city: "", state: "", complement: ""
  });

  // 1. Verificar Login
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  // 2. DETECTAR MUDANÇA NA URL (A MÁGICA ACONTECE AQUI) ✨
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'orders') setActiveTab('orders');
    else if (tabParam === 'addresses') setActiveTab('addresses');
    else setActiveTab('info');
  }, [searchParams]);

  // 3. Carregar Endereços
  useEffect(() => {
    if (activeTab === 'addresses') {
      setLoadingAddr(true);
      getAddresses()
        .then(setAddresses)
        .catch(console.error)
        .finally(() => setLoadingAddr(false));
    }
  }, [activeTab]);

  // 4. Carregar Pedidos
  useEffect(() => {
    if (activeTab === 'orders') {
      setLoadingOrders(true);
      getOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab]);

  const handleSaveAddress = async () => {
    if (!newAddr.street || !newAddr.zip_code) return alert("Preencha os dados obrigatórios");
    try {
      const saved = await createAddress(newAddr);
      setAddresses([...addresses, saved]);
      setShowNewAddrForm(false);
      setNewAddr({ name: "", zip_code: "", street: "", number: "", neighborhood: "", city: "", state: "", complement: "" });
    } catch (error) {
      alert("Erro ao salvar endereço");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      await deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Função para mudar a aba e atualizar a URL (para ficar sincronizado)
  const changeTab = (tab: 'info' | 'addresses' | 'orders') => {
    setActiveTab(tab);
    // Atualiza a URL sem recarregar a página
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  if (!user) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-serif text-gray-900 mb-8">Minha Conta</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* MENU LATERAL */}
        <div className="bg-white p-4 rounded-xl shadow-sm h-fit">
          <nav className="space-y-2">
            <button 
              onClick={() => changeTab('info')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'info' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <User className="w-5 h-5" /> Dados Pessoais
            </button>
            
            <button 
              onClick={() => changeTab('orders')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ShoppingBag className="w-5 h-5" /> Meus Pedidos
            </button>

            <button 
              onClick={() => changeTab('addresses')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'addresses' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <MapPin className="w-5 h-5" /> Endereços
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition mt-4 border-t"
            >
              <LogOut className="w-5 h-5" /> Sair da Conta
            </button>
          </nav>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="md:col-span-3 bg-white p-8 rounded-xl shadow-sm min-h-[400px]">
          
          {/* ABA: DADOS PESSOAIS */}
          {activeTab === 'info' && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Olá, {user.first_name}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                  <div className="p-3 bg-gray-50 rounded-lg border text-gray-800 mt-1">
                    {user.first_name} {user.last_name}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                  <div className="p-3 bg-gray-50 rounded-lg border text-gray-800 mt-1">
                    {user.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Telefone</label>
                  <div className="p-3 bg-gray-50 rounded-lg border text-gray-800 mt-1">
                    {user.phone || "Não informado"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: MEUS PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Histórico de Pedidos</h2>
              
              {loadingOrders ? (
                 <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600"/></div>
              ) : orders.length === 0 ? (
                 <div className="text-center py-10 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
                    Você ainda não fez nenhum pedido.
                 </div>
              ) : (
                 <div className="space-y-4">
                    {orders.map((order) => {
                       const statusInfo = statusMap[order.status] || statusMap.pending;
                       const StatusIcon = statusInfo.icon;

                       return (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition">
                             <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b pb-3">
                                <div>
                                   <span className="text-xs font-bold text-gray-500 uppercase">Pedido #{order.id}</span>
                                   <p className="text-sm text-gray-500">
                                      Feito em {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                   </p>
                                </div>
                                <div className="text-right">
                                   <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                      <StatusIcon className="w-3 h-3" /> {statusInfo.label}
                                   </span>
                                   <p className="font-bold text-gray-900 mt-1">
                                      Total: R$ {Number(order.total).toFixed(2)}
                                   </p>
                                </div>
                             </div>
                             <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                   <div key={idx} className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                         {item.product_image ? (
                                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover"/>
                                         ) : (
                                            <div className="w-full h-full bg-gray-200" />
                                         )}
                                      </div>
                                      <div className="flex-1 text-sm">
                                         <p className="font-medium text-gray-800">{item.product_name}</p>
                                         <p className="text-gray-500">{item.quantity}x R$ {Number(item.price).toFixed(2)}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       );
                    })}
                 </div>
              )}
            </div>
          )}

          {/* ABA: ENDEREÇOS */}
          {activeTab === 'addresses' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Meus Endereços</h2>
                <button onClick={() => setShowNewAddrForm(!showNewAddrForm)} className="text-sm bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> Novo
                </button>
              </div>
              {showNewAddrForm && (
                <div className="bg-gray-50 p-4 rounded-lg border mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                   <input placeholder="Nome (Ex: Casa)" className="border p-2 rounded" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} />
                   <input placeholder="CEP" className="border p-2 rounded" value={newAddr.zip_code} onChange={e => setNewAddr({...newAddr, zip_code: e.target.value})} />
                   <input placeholder="Rua" className="border p-2 rounded md:col-span-2" value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})} />
                   <input placeholder="Número" className="border p-2 rounded" value={newAddr.number} onChange={e => setNewAddr({...newAddr, number: e.target.value})} />
                   <input placeholder="Bairro" className="border p-2 rounded" value={newAddr.neighborhood} onChange={e => setNewAddr({...newAddr, neighborhood: e.target.value})} />
                   <input placeholder="Cidade" className="border p-2 rounded" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} />
                   <input placeholder="UF" className="border p-2 rounded" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} />
                   <button onClick={handleSaveAddress} className="col-span-2 bg-emerald-600 text-white py-2 rounded font-bold">Salvar Endereço</button>
                </div>
              )}
              {loadingAddr ? <Loader2 className="animate-spin mx-auto"/> : (
                 <div className="space-y-3">
                   {addresses.length === 0 && <p className="text-gray-500">Nenhum endereço cadastrado.</p>}
                   {addresses.map(addr => (
                      <div key={addr.id} className="border p-4 rounded-lg flex justify-between items-center group">
                         <div>
                            <p className="font-bold">{addr.name}</p>
                            <p className="text-sm text-gray-600">{addr.street}, {addr.number} - {addr.city}/{addr.state}</p>
                         </div>
                         <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4"/>
                         </button>
                      </div>
                   ))}
                 </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (Wrapper com Suspense) ---
// O useSearchParams precisa de Suspense para não quebrar no build
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Suspense fallback={<div className="text-center pt-20"><Loader2 className="animate-spin w-10 h-10 mx-auto text-emerald-600"/></div>}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}