import { Star, CreditCard } from "lucide-react";

interface ProductInfoProps {
  name: string;
  price: string;
}

export default function ProductInfo({ name, price }: ProductInfoProps) {
  // Cálculo simples de parcelas (Simulação: 10x sem juros)
  const priceNumber = parseFloat(price.replace(",", "."));
  const installmentValue = (priceNumber / 10).toFixed(2).replace(".", ",");

  return (
    <div className="mb-6">
      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">Nova Coleção</span>
      <h1 className="text-4xl font-serif text-gray-900 mb-4">{name}</h1>
      
      <div className="flex items-end space-x-4 mb-2">
        <span className="text-3xl font-bold text-gray-900">R$ {price}</span>
        <div className="flex items-center text-yellow-500 text-sm bg-yellow-50 px-2 py-1 rounded mb-1">
           <Star className="w-4 h-4 fill-current" />
           <span className="ml-1 text-gray-700 font-medium">5.0</span>
        </div>
      </div>

      <div className="flex items-center text-gray-500 text-sm mb-6">
        <CreditCard className="w-4 h-4 mr-2" />
        <span>Em até 10x de R$ {installmentValue} sem juros</span>
      </div>
    </div>
  );
}