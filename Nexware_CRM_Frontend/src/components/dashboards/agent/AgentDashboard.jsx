import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  DollarSign,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom"; // Assuming you use react-router
import api from "../../../api/api";
import { useAuthStore } from "../../../store/authStore";

const AgentDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    orders: [],
    leads: [],
  });

  // --- 1. Data Fetching ---
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${user?.token}` };

      // Fetch all data in parallel for speed
      const [productsRes, ordersRes, leadsRes] = await Promise.allSettled([
        axios.get(api.Product.GetAll, { headers }),
        axios.get(api.Order.GetAll, { headers }),
        axios.get(api.Leads.GetAll, { headers }),
      ]);

      // Helper to safely extract data from Promise.allSettled results
      const extractData = (result) => {
        if (result.status === "fulfilled" && result.value.data) {
           // Handle wrapped data { success: true, data: [...] } or direct arrays
           return Array.isArray(result.value.data) 
             ? result.value.data 
             : result.value.data.data || [];
        }
        return [];
      };

      setData({
        products: extractData(productsRes),
        orders: extractData(ordersRes),
        leads: extractData(leadsRes),
      });

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- 2. Derived Stats Calculation ---
  const stats = React.useMemo(() => {
    // Revenue
    const totalRevenue = data.orders.reduce((acc, order) => acc + (Number(order.totalAmount) || 0), 0);
    
    // Order Status
    const pendingOrders = data.orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length;
    
    // Inventory
    const lowStockCount = data.products.filter(p => (p.stock || 0) < 5).length;
    
    // Leads
    const activeLeads = data.leads.filter(l => l.status === "New" || l.status === "Follow Up" || l.status === "Incoming").length;

    return { totalRevenue, pendingOrders, lowStockCount, activeLeads };
  }, [data]);

  // --- 3. Render Helpers ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Agent"}!
            </h1>
            <p className="text-slate-500 mt-1">
              Here is what's happening in your store today.
            </p>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            bgClass="bg-green-50"
            trend="+12% from last month" 
            trendUp={true}
          />
          <StatCard 
            title="Active Orders" 
            value={stats.pendingOrders} 
            icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
            bgClass="bg-blue-50"
            subtext="Orders needing attention"
          />
          <StatCard 
            title="Active Leads" 
            value={stats.activeLeads} 
            icon={<Users className="w-6 h-6 text-purple-600" />}
            bgClass="bg-purple-50"
            subtext="Potential customers"
          />
          <StatCard 
            title="Low Stock Alerts" 
            value={stats.lowStockCount} 
            icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
            bgClass="bg-orange-50"
            alert={stats.lowStockCount > 0}
            subtext="Products below 5 units"
          />
        </div>

        {/* Main Content Split: Recent Orders & Recent Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Recent Orders (Takes up 2/3 width on large screens) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" />
                Recent Orders
              </h2>
              <Link to="/agent/orders" className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.orders.length > 0 ? (
                    data.orders.slice(0, 5).map((order, idx) => (
                      <tr key={order._id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {order.customerName || "Walk-in Customer"}
                        </td>
                        <td className="px-6 py-4">
                          <OrderStatusBadge status={order.orderStatus} />
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ₹{order.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Recent Leads (Takes up 1/3 width) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-400" />
                New Leads
              </h2>
              <Link to="/agent/leads" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                View All
              </Link>
            </div>
            
            <div className="p-0">
              {data.leads.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {data.leads.slice(0, 5).map((lead, idx) => (
                    <div key={lead._id || idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {lead.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{lead.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        lead.status === 'New' ? 'bg-green-100 text-green-700' : 
                        lead.status === 'Follow Up' ? 'bg-orange-100 text-orange-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No recent leads.
                </div>
              )}
            </div>
            
            <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100">
               <button className="w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
                 Create New Lead
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Sub-Components for cleanliness ---

const StatCard = ({ title, value, icon, bgClass, trend, trendUp, subtext, alert }) => (
  <div className={`bg-white p-6 rounded-xl border ${alert ? 'border-red-200 ring-2 ring-red-50' : 'border-slate-200'} shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-all`}>
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${bgClass} transition-colors`}>
        {icon}
      </div>
    </div>
    
    <div className="z-10 mt-auto">
      {trend ? (
        <p className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      ) : (
        <p className="text-xs text-slate-400">{subtext}</p>
      )}
    </div>

    {/* Decorative background circle */}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${bgClass.replace('bg-', 'bg-')}`} />
  </div>
);

const OrderStatusBadge = ({ status }) => {
  const styles = {
    Packed: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-800",
    Cancelled: "bg-red-100 text-red-700",
  };
  
  const defaultStyle = "bg-slate-100 text-slate-700";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || defaultStyle}`}>
      {status || "Unknown"}
    </span>
  );
};

export default AgentDashboard;