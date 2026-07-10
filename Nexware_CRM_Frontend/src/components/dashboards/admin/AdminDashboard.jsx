import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  IndianRupee,
  Package,
  Activity,
  MoreHorizontal,
  Calendar,
  ArrowRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import api from "../../../api/api";
import { useAuthStore } from "../../../store/authStore";
import Loader from "../../ui/Loader";

// --- Sub-Components ---

const StatusBadge = ({ status }) => {
  const colors = {
    Completed: "bg-emerald-50 text-emerald-600",
    Paid: "bg-emerald-50 text-emerald-600",
    Unpaid: "bg-rose-50 text-rose-600",
    Packed: "bg-blue-50 text-blue-600",
    Processing: "bg-amber-50 text-amber-600",
    Cancelled: "bg-gray-100 text-gray-500",
    Pending: "bg-orange-50 text-orange-600",
    New: "bg-indigo-50 text-indigo-600",
  };

  const formattedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span
      className={`px-3 py-1 rounded-lg text-[11px] font-bold ${colors[formattedStatus] || "bg-gray-50 text-gray-600"
        }`}
    >
      {formattedStatus}
    </span>
  );
};

export default function AdminDashboard() {
  const { user: authUser } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    revenue: { value: 0 },
    investment: { value: 0 },
    products: { value: 0 },
    leads: { value: 0 },
    users: { value: 0 },
    orders: { value: 0 },
  });

  const [recentData, setRecentData] = useState({
    orders: [],
    leads: [],
    products: [],
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Helpers ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filterByMonth = (data, dateField, monthOffset) => {
    const now = new Date();
    const targetMonth = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset,
      1
    );
    const endMonth = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset + 1,
      0
    );
    targetMonth.setHours(0, 0, 0, 0);
    endMonth.setHours(23, 59, 59, 999);

    return data.filter((item) => {
      const dateVal = item[dateField] || item.date || item.createdAt;
      const d = new Date(dateVal);
      return d >= targetMonth && d <= endMonth;
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${authUser?.token}` } };

      const [ordersRes, usersRes, leadsRes, productRes] = await Promise.all([
        axios.get(api.Order.GetAll, config),
        axios.get(api.User.GetAllUsers, config),
        axios.get(api.Leads.GetAll, config),
        axios.get(api.Product.GetAll, config),
      ]);

      const ordersData = ordersRes.data.data || [];
      const usersData = usersRes.data.data || [];
      const leadsData = leadsRes.data.data || [];
      const productsData = productRes.data.data || [];

      // Calculations
      const totalRevenue = ordersData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalInvestmentValue = productsData.reduce((sum, p) => sum + p.price * p.stock, 0);

      setStats({
        revenue: { value: totalRevenue },
        investment: { value: totalInvestmentValue },
        products: { value: productsData.length },
        leads: { value: leadsData.length },
        users: { value: usersData.length },
        orders: { value: ordersData.length },
      });

      // Chart Data Generation
      const generatedChartData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = d.toLocaleString("default", { month: "short" });

        const monthlyOrders = filterByMonth(ordersData, "createdAt", i);
        const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        const monthlyNewProducts = filterByMonth(productsData, "createdAt", i);
        const monthlyInvestment = monthlyNewProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

        generatedChartData.push({
          name: monthName,
          revenue: monthlyRevenue,
          investment: monthlyInvestment,
        });
      }
      setChartData(generatedChartData);

      setRecentData({
        orders: [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        leads: [...leadsData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
        products: [...productsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
      });
    } catch (error) {
      console.error("Dashboard API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Configuration ---
  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.revenue.value),
      icon: IndianRupee,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Total Investment",
      value: formatCurrency(stats.investment.value),
      icon: Activity,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      title: "Total Orders",
      value: stats.orders.value,
      icon: ShoppingCart,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "Total Leads",
      value: stats.leads.value,
      icon: TrendingUp,
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      title: "Total Users",
      value: stats.users.value,
      icon: Users,
      bg: "bg-pink-50",
      text: "text-pink-600",
    },
    {
      title: "Total Products",
      value: stats.products.value,
      icon: Package,
      bg: "bg-cyan-50",
      text: "text-cyan-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } },
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B254B] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-400 mt-1 font-medium text-sm">
              Welcome back, here's what's happening today.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            {loading ? "Syncing..." : "Refresh Stats"}
          </button>
        </div>

        {loading ? (
          <div className="h-[70vh] flex items-center justify-center">
            <Loader type="sphere" size="lg" color="text-blue-600" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Top Stat Cards - 3 Columns (2 Rows) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpiCards.map((kpi, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white p-5 rounded-[20px] shadow-sm border-none flex flex-row items-center gap-4 transition-all hover:shadow-md"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.text}`}
                  >
                    <kpi.icon className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-400">
                      {kpi.title}
                    </p>
                    <h3 className="text-2xl font-bold text-[#1B254B]">
                      {kpi.value}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Middle Section: Chart & Recent Orders */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* Financial Chart */}
              <motion.div
                variants={itemVariants}
                className="xl:col-span-2 bg-white rounded-[30px] shadow-sm p-8"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-[#1B254B]">
                      Sales & Views
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Revenue vs Stock Investment
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barGap={10}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A3AED0", fontSize: 12, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A3AED0", fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(val) => val > 1000 ? `${val / 1000}k` : val}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          backgroundColor: "#1B254B",
                          borderRadius: "12px",
                          border: "none",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(val) => formatCurrency(val)}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: "20px" }}
                      />
                      <Bar
                        dataKey="revenue"
                        name="Revenue"
                        fill="#4318FF"
                        radius={[20, 20, 20, 20]}
                        barSize={14}
                      />
                      <Bar
                        dataKey="investment"
                        name="Investment"
                        fill="#6AD2FF"
                        radius={[20, 20, 20, 20]}
                        barSize={14}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Recent Orders Side Panel */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-[30px] shadow-sm p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#1B254B]">
                    Recent Transactions
                  </h3>
                  <button
                    onClick={() => navigate("/admin/orders")}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                  >
                    See All <ArrowRight size={12} />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                  {recentData.orders.map((order, idx) => (
                    <div
                      key={order.id || order._id || idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white border border-transparent hover:border-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${idx % 2 === 0 ? "bg-indigo-50 text-indigo-600" : "bg-pink-50 text-pink-600"}`}>
                          {(order.customerName || "U").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1B254B]">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            ID: #{order.id ? order.id.slice(-6).toUpperCase() : (order._id ? order._id.slice(-6).toUpperCase() : "NA")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentData.orders.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">No recent orders</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Bottom Row: Products & Leads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Products Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-[30px] shadow-sm p-6 relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6 z-10 relative">
                  <h3 className="text-xl font-bold text-[#1B254B]">
                    Ongoing Projects (Stock)
                  </h3>
                  <button
                    onClick={() => navigate("/admin/products")}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreHorizontal className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3 z-10 relative">
                  {recentData.products.map((product, idx) => (
                    // FIX: Added robust key (id OR _id OR index)
                    <div key={product.id || product._id || idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-full h-full p-3 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#1B254B] truncate">{product.productName}</h4>
                        <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                      </div>
                      <div className="font-bold text-sm text-[#1B254B]">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Leads Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-[30px] shadow-sm p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#1B254B]">
                    Campaign (Leads)
                  </h3>
                  <button
                    onClick={() => navigate("/admin/leads")}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                  >
                    View All <ArrowRight size={12} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <tr>
                        <th className="pb-2 font-medium">Name</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {recentData.leads.map((lead, idx) => (
                        // FIX: Added robust key (id OR _id OR index)
                        <tr key={lead.id || lead._id || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="py-3 font-bold text-[#1B254B]">{lead.name}</td>
                          <td className="py-3 text-gray-500">{new Date(lead.date).toLocaleDateString()}</td>
                          <td className="py-3 text-right">
                            <StatusBadge status={lead.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}