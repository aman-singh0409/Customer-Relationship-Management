import React, { useMemo } from "react";
import { Package, IndianRupee, AlertTriangle, Layers, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ProductStats = ({ products = [] }) => {
  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, curr) => acc + (Number(curr.price || 0) * Number(curr.stock || 0)), 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0 || p.status === 'outofstock').length;
    const activeCount = products.filter(p => p.status === 'active').length;

    return [
      { label: "Total Inventory Value", val: `₹${totalValue.toLocaleString()}`, icon: IndianRupee, color: "emerald" },
      { label: "Total Products", val: products.length, change: `${activeCount} Active`, icon: Package, color: "blue" },
      { label: "Low Stock Alert", val: lowStockCount, icon: AlertTriangle, color: "amber" },
      { label: "Out of Stock", val: outOfStockCount, icon: Layers, color: "rose" },
    ];
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
      {stats.map((stat, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 border border-${stat.color}-100`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.val}</h3>
            {stat.change && <span className="text-xs font-bold text-emerald-600 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1"/> {stat.change}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductStats;