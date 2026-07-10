import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({ title, count, icon: Icon, trend, color = "indigo" }) => {
  const themes = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600 ring-indigo-100/50 group-hover:bg-indigo-600",
      blob: "bg-indigo-50",
      border: "hover:border-indigo-100",
      trendText: "text-indigo-600 bg-indigo-50"
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 ring-emerald-100/50 group-hover:bg-emerald-600",
      blob: "bg-emerald-50",
      border: "hover:border-emerald-100",
      trendText: "text-emerald-600 bg-emerald-50"
    },
    amber: {
      icon: "bg-amber-50 text-amber-600 ring-amber-100/50 group-hover:bg-amber-600",
      blob: "bg-amber-50",
      border: "hover:border-amber-100",
      trendText: "text-amber-600 bg-amber-50"
    },
    rose: {
      icon: "bg-rose-50 text-rose-600 ring-rose-100/50 group-hover:bg-rose-600",
      blob: "bg-rose-50",
      border: "hover:border-rose-100",
      trendText: "text-rose-600 bg-rose-50"
    },
  };

  const theme = themes[color] || themes.indigo;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden
        bg-white rounded-2xl p-6 
        border border-gray-100/80
        shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
        hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        cursor-pointer group
        transition-colors duration-300
        ${theme.border} 
      `}
    >
      <div className="flex justify-between items-start z-10 relative">
        {/* Left Side: Content */}
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-sm font-medium tracking-wide">
            {title}
          </span>
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
            {count}
          </h3>
          {trend && (
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md w-fit mt-2 ${theme.trendText}`}>
              {trend}
            </span>
          )}
        </div>
        {Icon && (
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            shadow-sm ring-1 
            group-hover:scale-110 group-hover:text-white
            transition-all duration-300 ease-out
            ${theme.icon}
          `}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>
      <div className={`
        absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl 
        opacity-0 group-hover:opacity-50 transition-opacity duration-500
        pointer-events-none
        ${theme.blob}
      `} />
    </motion.div>
  );
};

export default StatsCard;