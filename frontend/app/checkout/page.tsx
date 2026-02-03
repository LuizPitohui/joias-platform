"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { createOrder, getAddresses, createAddress } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, CheckCircle, MapPin, User as UserIcon, CreditCard, Loader2, Plus, Search, Save, Lock } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  // Estado para controlar a verificação de auth inicial
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  
  const [newAddr, setNewAddr] = useState({
    name: "",
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: ""
  });
  
  const [paymentMethod, setPaymentMethod] = useState("pix");

  const cartTotal = items ? items.reduce((acc, item) => {
    const price = typeof item.base_price === 'string' ? parseFloat(item.base_price) : Number(item.price || 0);
    return acc + (price * item.quantity);
  }, 0) : 0;

  const safeItems = items || [];

  // 1. PROTEÇÃO DE ROTA + Carregamento de Dados
  useEffect(() => {
    // Pequeno delay para garantir que o AuthContext carregou o usuário do localStorage
    const timer = setTimeout(() => {
      // Verifica o token direto no localStorage para ser mais rápido
      const token = localStorage.getItem("access_token");

      if (!token) {
        // Se não tem token, manda pro login
        alert("Você precisa estar logado para finalizar a compra.");
        router.push("/login");
      } else {
        // Se tem token, libera a tela
        setIsCheckingAuth(false);
      }
    }, 500); // 500ms de espera

    return () => clearTimeout(timer);
  }, [router]);

  // 2. Preenche dados quando o usuário é carregado
  useEffect(() => {
    if (user) {
      setName(`${user.first_name} ${user.last_name}`);
      setEmail(user.email);
      
      setLoadingAddresses(true);
      getAddresses()
        .then((data) => {
          setSavedAddresses(data);
          if (data.length > 0) {
            setSelectedAddressId(data[0].id.toString());
          }
        })
        .catch((err) => console.error("Erro ao buscar endereços", err))
        .finally(() => setLoadingAddresses(false));
    }
  }, [user]);

  // ... (Resto das funções handleCepBlur, handleSaveAddress igualzinho antes) ...
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, ''); 
    if (cep.length === 8) {
      setLoadingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setNewAddr(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
          document.getElementById("checkout-number")?.focus();
        } else {
          alert("CEP não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    setNewAddr({ ...newAddr, cep: value });
  };

  const handleSaveAddress = async () => {
    if (!newAddr.street || !newAddr.number || !newAddr.cep || !newAddr.city) {
        alert("Preencha o endereço completo para salvar.");
        return;
    }
    setSavingAddress(true);
    try {
        const payload = {
            name: newAddr.name || "Meu Endereço",
            zip_code: newAddr.cep,
            street: newAddr.street,
            number: newAddr.number,
            neighborhood: newAddr.neighborhood,
            city: newAddr.city,
            state: newAddr.state,
            complement: newAddr.complement
        };
        const createdAddress = await createAddress(payload);
        setSavedAddresses([...savedAddresses, createdAddress]);
        setSelectedAddressId(createdAddress.id.toString());
        setNewAddr({ name: "", cep: "", street: "", number: "", neighborhood: "", city: "", state: "", complement: "" });
        alert("Endereço salvo com sucesso!");
    } catch (error) {
        alert("Erro ao salvar endereço.");
        console.error(error);
    } finally {
        setSavingAddress(false);
    }
  };

  const handleFinishOrder = async () => {
    setLoading(true);
    try {
      let finalAddress = "";

      if (selectedAddressId === "new") {
        if (!newAddr.street || !newAddr.number || !newAddr.city) {
            alert("Por favor, preencha o endereço completo.");
            setLoading(false);
            return;
        }
        finalAddress = `${newAddr.street}, ${newAddr.number}`;
        if (newAddr.complement) finalAddress += ` - ${newAddr.complement}`;
        finalAddress += ` - ${newAddr.neighborhood}, ${newAddr.city}/${newAddr.state} - CEP: ${newAddr.cep}`;
      } 
      else {
        const addr = savedAddresses.find(a => a.id.toString() === selectedAddressId);
        if (addr) {
            finalAddress = `${addr.street}, ${addr.number}`;
            if (addr.complement) finalAddress += ` - ${addr.complement}`;
            finalAddress += ` - ${addr.neighborhood}, ${addr.city}/${addr.state} - CEP: ${addr.zip_code}`;
        }
      }

      const payload = {
        guest_name: name, // Ainda mandamos, mas agora sabemos que vem do Auth
        guest_email: email,
        address: finalAddress,
        total: cartTotal,
        items_data: safeItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: typeof item.base_price === 'string' ? parseFloat(item.base_price) : item.price
        }))
      };

      await createOrder(payload);
      clearCart();
      alert("Pedido realizado com sucesso! 🎉");
      router.push("/"); 

    } catch (error: any) {
      alert("Erro ao finalizar compra.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // TELA DE LOADING ENQUANTO VERIFICA LOGIN
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-600">Verificando login...</p>
      </div>
    );
  }

  if (safeItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-serif text-gray-800 mb-4">Seu carrinho está vazio</h2>
        <Link href="/" className="text-emerald-800 hover:underline">Voltar para a loja</Link>
      </div>
    );
  }

  return (
    // ... (O JSX do retorno continua EXATAMENTE IGUAL ao anterior, só mudei a lógica acima)
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-800 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Continuar Comprando
        </Link>
        <h1 className="text-3xl font-serif text-gray-900 mb-8 flex items-center gap-2">
            <Lock className="w-6 h-6 text-emerald-700"/> Finalizar Compra
        </h1>
        {/* ... (Todo o resto do HTML igual ao anterior) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <UserIcon className="w-5 h-5 text-emerald-700" /> Seus Dados
              </h2>
              <div className="space-y-4">
                <input type="text" placeholder="Nome Completo" required className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50" value={name} readOnly />
                <input type="email" placeholder="Seu Email" required className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50" value={email} readOnly />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <MapPin className="w-5 h-5 text-emerald-700" /> Entrega
                  </h2>
                  <Link href="/profile" className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3"/> Gerenciar Endereços
                   </Link>
              </div>
              {loadingAddresses ? (
                <div className="py-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600"/></div>
              ) : (
                <div className="space-y-3">
                   {savedAddresses.map((addr) => (
                      <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${selectedAddressId === addr.id.toString() ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-gray-200 hover:border-emerald-300'}`}>
                        <input type="radio" name="address_select" className="mt-1 text-emerald-600 focus:ring-emerald-500" checked={selectedAddressId === addr.id.toString()} onChange={() => setSelectedAddressId(addr.id.toString())} />
                        <div className="flex-1">
                            <span className="font-bold text-gray-900 block">{addr.name}</span>
                            <span className="text-sm text-gray-600 block mt-1">{addr.street}, {addr.number} {addr.complement ? `- ${addr.complement}` : ''}</span>
                            <span className="text-xs text-gray-500 block">{addr.neighborhood} - {addr.city}/{addr.state} • CEP {addr.zip_code}</span>
                        </div>
                      </label>
                   ))}
                   <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${selectedAddressId === 'new' ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-gray-200 hover:border-emerald-300'}`}>
                        <input type="radio" name="address_select" className="mt-1 text-emerald-600 focus:ring-emerald-500" checked={selectedAddressId === 'new'} onChange={() => setSelectedAddressId('new')} />
                        <span className="font-bold text-gray-900 mt-0.5">Entregar em outro endereço</span>
                   </label>
                   {selectedAddressId === 'new' && (
                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fadeIn grid grid-cols-1 md:grid-cols-6 gap-3 mt-3">
                        <div className="md:col-span-6">
                            <label className="text-xs font-bold text-gray-500">SALVAR COMO (OPCIONAL)</label>
                            <input className="w-full border p-2 rounded" placeholder="Ex: Casa da Praia" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} />
                        </div>
                        <div className="md:col-span-2 relative">
                            <label className="text-xs font-bold text-gray-500">CEP</label>
                            <input className="w-full border p-2 rounded pr-8" placeholder="00000-000" value={newAddr.cep} onChange={handleCepChange} onBlur={handleCepBlur} />
                            <div className="absolute right-2 top-7">{loadingCEP ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600"/> : <Search className="w-4 h-4 text-gray-400"/>}</div>
                        </div>
                        <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500">CIDADE</label><input className="w-full border p-2 rounded bg-gray-200" value={newAddr.city} readOnly /></div>
                        <div className="md:col-span-1"><label className="text-xs font-bold text-gray-500">UF</label><input className="w-full border p-2 rounded bg-gray-200" value={newAddr.state} readOnly /></div>
                        <div className="md:col-span-4"><label className="text-xs font-bold text-gray-500">RUA</label><input className="w-full border p-2 rounded bg-white" value={newAddr.street} onChange={e => setNewAddr({...newAddr, street: e.target.value})} /></div>
                        <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">NÚMERO</label><input id="checkout-number" className="w-full border p-2 rounded border-emerald-300 ring-2 ring-emerald-50" value={newAddr.number} onChange={e => setNewAddr({...newAddr, number: e.target.value})} /></div>
                        <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500">BAIRRO</label><input className="w-full border p-2 rounded bg-white" value={newAddr.neighborhood} onChange={e => setNewAddr({...newAddr, neighborhood: e.target.value})} /></div>
                        <div className="md:col-span-3"><label className="text-xs font-bold text-gray-500">COMPLEMENTO</label><input className="w-full border p-2 rounded bg-white" placeholder="Ex: Apt 101" value={newAddr.complement} onChange={e => setNewAddr({...newAddr, complement: e.target.value})} /></div>
                        <div className="md:col-span-6 flex justify-end mt-2">
                            <button type="button" onClick={handleSaveAddress} disabled={savingAddress} className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 transition">
                                {savingAddress ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Salvar Endereço
                            </button>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4"><CreditCard className="w-5 h-5 text-emerald-700" /> Pagamento</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPaymentMethod('pix')} className={`p-4 rounded-lg border text-center transition font-bold ${paymentMethod === 'pix' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300'}`}>PIX</button>
                <button onClick={() => setPaymentMethod('card')} className={`p-4 rounded-lg border text-center transition font-bold ${paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-gray-300'}`}>Cartão</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Resumo do Pedido</h2>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {safeItems.map((item, index) => {
                   const price = typeof item.base_price === 'string' ? parseFloat(item.base_price) : Number(item.price || 0);
                   return (
                      <div key={`${item.id}-${index}`} className="flex justify-between text-sm group">
                        <span className="text-gray-600 group-hover:text-gray-900 transition">{item.quantity}x {item.name}</span>
                        <span className="font-medium text-gray-900">R$ {(price * item.quantity).toFixed(2)}</span>
                      </div>
                   );
                })}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Frete</span><span className="text-emerald-600 font-medium">Grátis</span></div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-2"><span>Total</span><span>R$ {cartTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={handleFinishOrder} disabled={loading} className="w-full bg-black text-white py-4 rounded-lg font-bold mt-8 hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Confirmar Pedido</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}