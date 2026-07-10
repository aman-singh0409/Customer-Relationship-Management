import React from "react";
import { Plus, Sparkles, Package } from "lucide-react";

const ProductHeader = ({ onAddClick }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600 opacity-80" />
          Product Inventory
        </h1>
        <p className="text-slate-500 text-sm max-w-lg leading-relaxed mt-1">
          Manage your entire catalog. Track stock levels, update pricing, and organize product categories.
        </p>
      </div>
      <button onClick={onAddClick} className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 hover:scale-[1.02] shadow-lg transition-all">
        <Plus className="w-4 h-4 text-emerald-400" />
        <span>Add New Product</span>
      </button>
    </div>
  );
};
export default ProductHeader;