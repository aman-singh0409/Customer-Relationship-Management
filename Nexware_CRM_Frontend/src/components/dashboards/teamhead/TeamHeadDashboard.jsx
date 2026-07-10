import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Briefcase,
  ArrowRight,
  Activity,
  Calendar,
  Loader2,
  Phone,
  Mail,
  UserCheck
} from "lucide-react";

import api from "../../../api/api";
import { useAuthStore } from "../../../store/authStore";

const TeamHeadDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // --- Dashboard State ---
  const [stats, setStats] = useState({
    teamRevenue: 0,
    totalOrders: 0,
    activeLeads: 0,
    teamSize: 0,
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user?.token) return;

      setLoading(true);
      try {
        const [usersRes, leadsRes, ordersRes] = await Promise.allSettled([
          axios.get(api.User.AdminGetAll, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(api.Leads.GetAll, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(api.Order.GetAll, { headers: { Authorization: `Bearer ${user.token}` } }),
        ]);

        // 1. Process Team Members (Filter for Agents)
        let agents = [];
        if (usersRes.status === "fulfilled") {
          const data = usersRes.value.data;
          const allUsers = Array.isArray(data) ? data : data.users || [];
          // Assuming Team Head manages 'agents'. Adjust role filter as needed.
          agents = allUsers.filter(u => u.role === 'agent' || u.role === 'employee');
        }

        // 2. Process Leads
        let activeLeadsCount = 0;
        let recentL = [];
        if (leadsRes.status === "fulfilled") {
          const data = leadsRes.value.data?.data || [];
          
          // Count leads that aren't "Lost" or "Cancelled"
          activeLeadsCount = data.filter(l => !['lost', 'cancelled', 'junk'].includes(l.status?.toLowerCase())).length;

          // Get recent 5 leads
          recentL = data
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5);
        }

        // 3. Process Orders (Revenue)
        let revenue = 0;
        let ordersCount = 0;
        if (ordersRes.status === "fulfilled") {
          const data = ordersRes.value.data?.data || [];
          ordersCount = data.length;
          revenue = data.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
        }

        // Update State
        setStats({
          teamRevenue: revenue,
          totalOrders: ordersCount,
          activeLeads: activeLeadsCount,
          teamSize: agents.length,
        });

        setTeamMembers(agents.slice(0, 5)); // Show top 5 agents
        setRecentLeads(recentL);

      } catch (error) {
        console.error("Error loading team dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user?.token]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading Team Overview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Team Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Hello {user?.name}, here is your team's performance summary.
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
          title="Team Revenue"
          value={formatCurrency(stats.teamRevenue)}
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
          title="Active Leads"
          value={stats.activeLeads}
          icon={TrendingUp}
          color="violet"
        />
        <StatCard
          title="Agents Managed"
          value={stats.teamSize}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT: Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 rounded-xl">
                <Briefcase className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Leads</h3>
            </div>
            <Link to="/team-head/leads" className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1">
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
                      {/* Action Buttons */}
                      <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lead.phone && <a href={`tel:${lead.phone}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Phone className="w-4 h-4"/></a>}
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
                <EmptyState message="No recent leads assigned." />
            )}
          </div>
        </div>

        {/* RIGHT: Team Members Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 rounded-xl">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-slate-900">My Agents</h3>
            </div>
            <Link to="/team-head/users" className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1">
              Manage Team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-2 flex-1">
            {teamMembers.length > 0 ? (
              <div className="space-y-1">
                {teamMembers.map((agent) => (
                  <div key={agent._id || agent.id} className="p-3 hover:bg-slate-50 rounded-xl transition-all duration-200 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 font-bold text-xs uppercase">
                        {(agent.name || "A").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{agent.name || "Unknown Agent"}</p>
                        <p className="text-xs text-slate-500">{agent.email || "No Email"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-slate-600">{agent.phone || "No Phone"}</p>
                        <p className="text-[10px] text-slate-400">Agent</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                         <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <EmptyState message="No agents found in your team." />
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

export default TeamHeadDashboard;