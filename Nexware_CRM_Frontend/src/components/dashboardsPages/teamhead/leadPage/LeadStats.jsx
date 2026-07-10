// components/lead/LeadStats.jsx
import React, { useMemo } from "react";
import { 
  Users, 
  Target, 
  Wallet, 
  Clock, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import { motion } from "framer-motion";

const LeadStats = ({ leads = [] }) => {

  // --- Calculate Real Stats from Data ---
  const stats = useMemo(() => {
    const total = leads.length;
    
    // Count specific statuses
    const converted = leads.filter(l => l.status === "Sale Done" || l.status === "Won").length;
    const followUps = leads.filter(l => l.status === "Follow Up").length;
    
    // Calculate Conversion Rate
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";

    // Estimate Pipeline (Mock logic: Assuming each lead is worth something, or use lead.value if it exists)
    // If you add a 'value' field to your schema later, change this line:
    // const value = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const activeLeads = leads.filter(l => ["Ring", "Follow Up", "Incoming"].includes(l.status)).length;

    return [
      { 
        label: "Total Leads", 
        val: total, 
        change: "+12%", // You can calculate this if you have date ranges
        icon: Users, 
        color: "blue",
        trend: "up"
      },
      { 
        label: "Conversion Rate", 
        val: `${conversionRate}%`, 
        change: "+2.1%", 
        icon: Target, 
        color: "emerald",
        trend: "up"
      },
      { 
        label: "Active Pipeline", 
        val: activeLeads, 
        change: "Active", 
        icon: Wallet, 
        color: "violet",
        trend: "neutral"
      },
      { 
        label: "Pending Follow Ups", 
        val: followUps, 
        change: "Urgent", 
        icon: Clock, 
        color: "amber",
        trend: "down"
      },
    ];
  }, [leads]);

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, idx) => {
        // Color Styles Configuration
        const colorStyles = {
          blue: "bg-blue-50 text-blue-600 border-blue-100",
          emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
          violet: "bg-violet-50 text-violet-600 border-violet-100",
          amber: "bg-amber-50 text-amber-600 border-amber-100",
        };

        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow group"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              {/* Icon Box */}
              <div className={`p-3 rounded-xl ${colorStyles[stat.color]} border`}>
                <stat.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>

              {/* Trend/Info Badge */}
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100`}>
                {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                {stat.trend === "down" && <TrendingDown className="w-3 h-3 text-amber-500" />}
                {stat.change}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {stat.val}
              </h3>
            </div>

            {/* Decorative Background Blob (Appears on Hover) */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${colorStyles[stat.color].split(" ")[0].replace("bg-", "bg-")}`} />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default LeadStats;