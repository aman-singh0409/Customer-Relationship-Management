import React from "react";
import { Plus, Sparkles, ShoppingBag } from "lucide-react";

const OrderHeader = ({ onAddClick }) => {
  return (
    <div className="flex flex-wrap justify-between items-end gap-5 pb-6 border-b border-slate-200 mb-8 font-sans">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3 tracking-tight">
          <ShoppingBag size={28} className="text-slate-900" />
          Orders Overview
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Manage your order pipeline efficiently. Track incoming orders, check
          payment statuses, and download invoices in real-time.
        </p>
      </div>

      <button
        onClick={onAddClick}
        className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      >
        <div className="bg-slate-800 rounded-md p-1 border border-slate-700 flex items-center">
          <Plus size={16} className="text-blue-400" />
        </div>
        <span>Create New Order</span>
        <Sparkles className="w-4 h-4 text-yellow-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </button>
    </div>
  );
};

export default OrderHeader;
