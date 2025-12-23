import { Star } from "lucide-react";

export default function ProductReviews() {
  // Mock de dados (fingindo que vieram do banco)
  const reviews = [
    { id: 1, name: "Ana Clara", date: "Há 2 dias", rating: 5, text: "Simplesmente perfeito! O brilho da pedra é incrível pessoalmente." },
    { id: 2, name: "Roberto M.", date: "Há 1 semana", rating: 5, text: "Chegou antes do prazo e a embalagem é um luxo. Minha esposa amou." },
    { id: 3, name: "Juliana S.", date: "Há 3 semanas", rating: 4, text: "O anel é lindo, mas achei que o aro ficou um pouco justo. O atendimento resolveu rápido." },
  ];

  return (
    <div className="border-t border-gray-100 py-16 mt-16 bg-gray-50 -mx-4 px-4 sm:px-0 sm:mx-0 sm:bg-transparent">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-serif text-gray-900 mb-8 text-center">Avaliações dos Clientes</h2>
        
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">"{review.text}"</p>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-8 text-emerald-800 text-sm font-bold hover:underline">
          Ver todas as 24 avaliações
        </button>
      </div>
    </div>
  );
}