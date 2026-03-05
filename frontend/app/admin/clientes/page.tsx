"use client";

import { useEffect, useState } from "react";
import { 
  Users, Search, Loader2, Mail, Phone, 
  MapPin, ShieldCheck, User as UserIcon, ChevronLeft, ChevronRight,
  X, Fingerprint, CalendarDays, Map, CreditCard
} from "lucide-react";
import { getUsers } from "@/services/api";

interface Address {
  id: number;
  name?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference_point?: string;
}

interface Customer {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  cpf?: string;
  phone?: string;
  addresses: Address[];
  is_staff?: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Paginação e Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal de Detalhes
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getUsers();
        setCustomers(data || []);
      } catch (error) {
        console.error("Erro ao carregar clientes", error);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  // Lógica de Filtro
  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    const matchesEmail = (customer.email || "").toLowerCase().includes(search);
    const matchesPhone = (customer.phone || "").toLowerCase().includes(search);
    const matchesCpf = (customer.cpf || "").toLowerCase().includes(search);
    const matchesName = (`${customer.first_name || ""} ${customer.last_name || ""}`).toLowerCase().includes(search);
    return matchesEmail || matchesPhone || matchesCpf || matchesName;
  });

  // Lógica de Paginação
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 animate-fadeIn relative">
      
      {/* CABEÇALHO */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Gestão de Clientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visualize e gerencie a base de usuários da sua joalheria.
          </p>
        </div>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-6 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
           <div className="text-right">
             <p className="text-xs uppercase font-bold opacity-70">Total Cadastrados</p>
             <p className="text-2xl font-black leading-none">{customers.length}</p>
           </div>
           <Users className="w-8 h-8 opacity-50" />
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex items-center transition-colors">
        <div className="flex items-center gap-3 w-full px-4 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, email, telefone ou CPF..." 
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white text-lg placeholder:text-gray-400" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* TABELA DE CLIENTES */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-indigo-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold text-gray-500">Buscando clientes no cofre...</p>
          </div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="p-20 text-center text-gray-400 flex flex-col items-center">
            <UserIcon className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Nenhum cliente encontrado com esses dados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5">Contato</th>
                  <th className="px-6 py-5 text-center">Endereços Salvos</th>
                  <th className="px-6 py-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group cursor-pointer"
                  >
                    {/* COLUNA: CLIENTE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                          {customer.first_name ? customer.first_name[0].toUpperCase() : (customer.email ? customer.email[0].toUpperCase() : 'C')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {customer.first_name ? `${customer.first_name} ${customer.last_name || ""}` : customer.email}
                          </p>
                          {customer.cpf && <p className="text-xs text-gray-500 font-mono mt-0.5">CPF: {customer.cpf}</p>}
                        </div>
                      </div>
                    </td>

                    {/* COLUNA: CONTATO */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                         <div className="flex items-center gap-2">
                           <Mail className="w-3.5 h-3.5" />
                           <span className="truncate max-w-[150px] block" title={customer.email}>{customer.email}</span>
                         </div>
                         {customer.phone && (
                           <div className="flex items-center gap-2">
                             <Phone className="w-3.5 h-3.5 text-emerald-500" />
                             <span>{customer.phone}</span>
                           </div>
                         )}
                      </div>
                    </td>

                    {/* COLUNA: ENDEREÇOS */}
                    <td className="px-6 py-4 text-center">
                      {customer.addresses && customer.addresses.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                          <MapPin className="w-3.5 h-3.5" />
                          {customer.addresses.length} salvo(s)
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Nenhum</span>
                      )}
                    </td>

                    {/* COLUNA: AÇÃO */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Perfil &rarr;
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINAÇÃO */}
        {!loading && paginatedCustomers.length > 0 && (
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Mostrando página <span className="font-bold">{currentPage}</span> de {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1} 
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages} 
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL DE PERFIL DO CLIENTE (O RAIO-X)                       */}
      {/* ========================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 relative">
            
            {/* Botão Fechar */}
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header do Modal */}
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-indigo-50/50 dark:bg-indigo-900/10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
                  {selectedCustomer.first_name ? selectedCustomer.first_name[0].toUpperCase() : selectedCustomer.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedCustomer.first_name ? `${selectedCustomer.first_name} ${selectedCustomer.last_name || ""}` : 'Cliente Sem Nome'}
                  </h2>
                  <div className="flex items-center gap-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Conta Verificada</span>
                    <span className="flex items-center gap-1 text-gray-400">| ID: #{selectedCustomer.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corpo do Modal */}
            <div className="p-8 space-y-8">
              
              {/* Seção: Dados Pessoais */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Informações de Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">E-mail Principal</p>
                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" /> {selectedCustomer.email}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Telefone (WhatsApp)</p>
                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" /> {selectedCustomer.phone || "Não informado"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">CPF</p>
                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" /> {selectedCustomer.cpf || "Não informado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção: Endereços */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                  <Map className="w-4 h-4" /> Caderno de Endereços
                </h3>
                
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomer.addresses.map((addr) => (
                      <div key={addr.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                        <div className="pl-2">
                          <p className="font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                            {addr.name || "Endereço"}
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">CEP: {addr.zip_code}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {addr.neighborhood} — {addr.city}/{addr.state}
                          </p>
                          {addr.reference_point && (
                            <p className="text-xs text-gray-500 mt-2 italic flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Ref: {addr.reference_point}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <MapPin className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">Este cliente ainda não salvou nenhum endereço de entrega.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}