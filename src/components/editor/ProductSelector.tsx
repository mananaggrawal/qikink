"use client";

import { PRODUCTS } from "@/lib/catalog";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function ProductSelector() {
  const { selectedProduct, setProduct } = useAppStore();

  return (
    <div className="grid grid-cols-2 gap-2">
      {PRODUCTS.map((p) => (
        <button
          key={p.id}
          onClick={() => setProduct(p)}
          className={cn(
            "flex flex-col items-center p-3 rounded-xl border text-center transition-all",
            selectedProduct.id === p.id
              ? "border-indigo-500 bg-indigo-950/50 text-indigo-300"
              : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300"
          )}
        >
          <div className="text-2xl mb-1">
            {p.id === "tshirt-oversized" && "👕"}
            {p.id === "hoodie-black" && "🧥"}
            {p.id === "mug-white" && "☕"}
            {p.id === "phone-case" && "📱"}
            {p.id === "tote-bag" && "👜"}
          </div>
          <span className="text-xs font-medium leading-tight">{p.name}</span>
          <span className="text-xs text-gray-500 mt-0.5">₹{p.basePrice}</span>
        </button>
      ))}
    </div>
  );
}
