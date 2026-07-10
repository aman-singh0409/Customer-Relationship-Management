import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  ShoppingBag,
  IndianRupee, // Changed to IndianRupee icon
  Briefcase,
  ArrowRight,
  Activity,
  Calendar,
  Loader2,
  Phone,
  Mail
} from "lucide-react";

import api from "../../../api/api";
import { useAuthStore } from "../../../store/authStore";

const SubAdminDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // --- State for Dashboard Data ---
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentLeads, setRecentLeads] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // --- Fetch Data from Real API ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Prevent fetch if no token
      if (!user?.token) return;

      setLoading(true);
      try {
        // Fetch all necessary data in parallel
        const [usersRes, leadsRes, ordersRes] = await Promise.allSettled([
          axios.get(api.User.AdminGetAll, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(api.Leads.GetAll, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(api.Order.GetAll, { headers: { Authorization: `Bearer ${user.token}` } }),
        ]);

        // 1. Process Users
        let userCount = 0;
        if (usersRes.status === "fulfilled") {
          const data = usersRes.value.data;
          // Handle if API returns array directly or { users: [...] }
          const userList = Array.isArray(data) ? data : data.users || [];
          userCount = userList.length;
        }

        // 2. Process Leads
        let leadsCount = 0;
        let recentL = [];
        if (leadsRes.status === "fulfilled") {
          const data = leadsRes.value.data?.data || [];
          leadsCount = data.length;

          // Sort by createdAt desc, take top 5
          recentL = data
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5);
        }

        // 3. Process Orders
        let ordersCount = 0;
        let revenue = 0;
        let recentO = [];
        if (ordersRes.status === "fulfilled") {
          const data = ordersRes.value.data?.data || [];
          ordersCount = data.length;

          // Calculate Total Revenue (Sum of totalAmount)
          revenue = data.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

          // Sort by createdAt desc, take top 5
          recentO = data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        }

        // Update State
        setStats({
          totalUsers: userCount,
          totalLeads: leadsCount,
          totalOrders: ordersCount,
          totalRevenue: revenue,
        });
        setRecentLeads(recentL);
        setRecentOrders(recentO);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.token]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Syncing dashboard data...</p>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.name || "Admin"}. Here is your live overview.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-sm text-slate-600 font-medium">
          <Calendar className="w-4 h-4 text-slate-400" />
          {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={TrendingUp}
          color="violet"
        />
        <StatCard
          title="Team Members"
          value={stats.totalUsers}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT: Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Orders</h3>
            </div>
            <Link to="/sub-admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="p-2 flex-1">
            {recentOrders.length > 0 ? (
              <div className="space-y-1">
                {recentOrders.map((order) => (
                  <div key={order._id || order.id} className="p-3 hover:bg-slate-50 rounded-xl transition-all duration-200 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      {/* Initials Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200 uppercase">
                        {(order.customerName || "U").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{order.customerName || "Walk-in Customer"}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-1 ${getOrderStatusColor(order.status)}`}>
                        {order.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <EmptyState message="No orders found yet." />
            )}
          </div>
        </div>

        {/* RIGHT: Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900">New Leads</h3>
            </div>
            <Link to="/sub-admin/leads" className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-2 flex-1">
            {recentLeads.length > 0 ? (
              <div className="space-y-1">
                {recentLeads.map((lead) => (
                  <div key={lead._id || lead.id} className="p-3 hover:bg-slate-50 rounded-xl transition-all duration-200 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{lead.name || "Unknown Lead"}</p>
                        <p className="text-xs text-slate-500">{lead.service || "General Inquiry"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Quick Actions (Hover) */}
                      <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {lead.phone && <a href={`tel:${lead.phone}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Phone className="w-4 h-4"/></a>}
                         {lead.email && <a href={`mailto:${lead.email}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Mail className="w-4 h-4"/></a>}
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${getLeadStatusColor(lead.status)}`}>
                          {lead.status || "New"}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(lead.createdAt || lead.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <EmptyState message="No leads found yet." />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
      <div className="bg-slate-50 p-4 rounded-full mb-3">
        <Activity className="w-6 h-6 opacity-50" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );

// --- Utilities ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getOrderStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "processing":
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "cancelled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getLeadStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "new": return "bg-blue-50 text-blue-700 border border-blue-100";
      case "contacted": return "bg-amber-50 text-amber-700 border border-amber-100";
      case "qualified": return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "lost": return "bg-slate-100 text-slate-500 border border-slate-200";
      case "proposal sent": return "bg-violet-50 text-violet-700 border border-violet-100";
      default: return "bg-slate-50 text-slate-600";
    }
};

export default SubAdminDashboard;