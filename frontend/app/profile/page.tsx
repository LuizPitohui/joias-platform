"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { User, Phone, MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// ADICIONE "export default" AQUI
export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [smsCode, setSmsCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user?.phone) {
        setPhone(user.phone);
    }
  }, [user, authLoading, router]);

  const handleSendSMS = async () => {
    if (!phone) return alert("Digite um número de telefone.");
    setLoading(true);
    try {
      await api.post('/send-sms/', { phone });
      setIsVerifying(true);
      alert("Código enviado! (Verifique o terminal do Backend/VS Code)");
    } catch (error) {
      alert("Erro ao enviar código. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await api.post('/verify-sms/', { code: smsCode });
      alert("Telefone Verificado com Sucesso! 🎉");
      setIsVerifying(false);
      window.location.reload(); // Recarrega para atualizar o status do usuário
    } catch (error) {
      alert("Código incorreto.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-500 mb-8">Gerencie suas informações pessoais e de segurança.</p>
        
        {/* CARTÃO DE DADOS PESSOAIS */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-6 border-b pb-4">
            <User className="w-5 h-5 text-emerald-700" /> Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nome Completo</label>
              <p className="text-gray-900 font-medium text-lg">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900 font-medium text-lg">{user.email}</p>
            </div>
          </div>
        </div>

        {/* CARTÃO DE TELEFONE (VERIFICAÇÃO) */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b pb-4">
            <Phone className="w-5 h-5 text-emerald-700" /> Verificação de Telefone
          </h2>
          
          <div className="flex items-start gap-4">
            <div className="flex-1">
                <p className="text-sm text-gray-600 mb-4">
                    Precisamos confirmar seu número para garantir a segurança das entregas.
                </p>
                
                <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isVerifying} // Trava se estiver esperando código
                      className="border border-gray-300 p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    
                    {!isVerifying && (
                        <button 
                            onClick={handleSendSMS} 
                            disabled={loading}
                            className="bg-emerald-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800 transition disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Enviar Código"}
                        </button>
                    )}
                </div>

                {/* ÁREA DE DIGITAR O CÓDIGO */}
                {isVerifying && (
                  <div className="mt-6 p-6 bg-emerald-50 rounded-xl border border-emerald-100 animate-fadeIn">
                    <label className="block text-sm font-bold text-emerald-800 mb-3 text-center">
                        Digite o código de 6 dígitos enviado:
                    </label>
                    <div className="flex justify-center gap-3">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        placeholder="000000"
                        className="border-2 border-emerald-200 p-3 rounded-lg w-40 tracking-[0.5em] text-center font-bold text-xl outline-none focus:border-emerald-500"
                      />
                      <button 
                        onClick={handleVerifyCode} 
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 shadow-sm disabled:opacity-50"
                      >
                        {loading ? "Validando..." : "Confirmar"}
                      </button>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-4">
                        (Como estamos em teste, olhe o código no terminal do VS Code onde o Backend roda)
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* CARTÃO DE ENDEREÇO (SIMPLES) */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 opacity-75">
             <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b pb-4">
                <MapPin className="w-5 h-5 text-gray-500" /> Endereços
            </h2>
            <p className="text-gray-500 text-sm">Você poderá gerenciar seus endereços de entrega diretamente no Checkout.</p>
        </div>

      </div>
    </div>
  );
}