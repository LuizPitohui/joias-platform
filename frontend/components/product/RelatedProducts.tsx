import Link from "next/link";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  images: { image: string }[];
}

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="border-t border-gray-100 pt-16">
      <h2 className="text-2xl font-serif text-gray-900 mb-8">Quem viu este, também gostou</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <Link key={p.id} href={`/produto/${p.slug}`} className="group">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 border border-gray-100">
              {p.images[0] ? (
                <img src={p.images[0].image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sem foto</div>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-emerald-800 transition">{p.name}</h3>
            <p className="text-sm text-gray-500 mt-1">R$ {p.base_price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}