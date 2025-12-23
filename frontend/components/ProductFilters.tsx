"use client";

import { useState } from "react";

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
}

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [material, setMaterial] = useState<string[]>([]);

  const handleApply = () => {
    onFilterChange({
      min_price: minPrice,
      max_price: maxPrice,
      material: material
    });
  };

  const toggleMaterial = (value: string) => {
    if (material.includes(value)) {
      setMaterial(material.filter(m => m !== value));
    } else {
      setMaterial([...material, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Filtro de Preço */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Preço</h3>
        <div className="flex items-center gap-2 mb-4">
          <input 
            type="number" placeholder="Min" 
            className="w-full p-2 border border-gray-200 rounded text-sm"
            value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" placeholder="Max" 
            className="w-full p-2 border border-gray-200 rounded text-sm"
            value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Filtro de Material (Hardcoded por enquanto, depois pode vir da API) */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Material</h3>
        <div className="space-y-2">
          {['Ouro 18k', 'Prata 925', 'Ouro Branco', 'Ouro Rosé'].map((mat) => (
            <label key={mat} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 border rounded flex items-center justify-center transition ${material.includes(mat) ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-500'}`}>
                {material.includes(mat) && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <input 
                type="checkbox" className="hidden"
                checked={material.includes(mat)}
                onChange={() => toggleMaterial(mat)}
              />
              <span className="text-sm text-gray-600">{mat}</span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={handleApply}
        className="w-full bg-black text-white py-2 rounded text-sm font-bold hover:bg-gray-800 transition"
      >
        Filtrar
      </button>
    </div>
  );
}