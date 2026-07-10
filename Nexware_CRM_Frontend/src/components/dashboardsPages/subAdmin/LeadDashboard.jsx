import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Loader2, Inbox } from "lucide-react";
import { AnimatePresence } from "framer-motion";

// Components
import LeadHeader from "./leadPage/LeadHeader";
import LeadStats from "./leadPage/LeadStats";
import LeadTabs from "./leadPage/LeadTabs";
import LeadTable from "./leadPage/LeadTable";
import LeadEmptyState from "./leadPage/LeadEmptyState";
import AddLeadModal from "./leadPage/AddLeadModal";

import api from "../../../api/api";
import { useAuthStore } from "../../../store/authStore";

const LeadDashboard = () => {
  const { user: authUser } = useAuthStore();

  // --- State ---
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. Fetch Data (Memoized) ---
  const fetchLeads = useCallback(async () => {
    try {
      const token = authUser?.token;
      if (!token) return;

      if (leads.length === 0) setLoading(true);

      const res = await axios.get(api.Leads.GetAll, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || [];

      const mappedLeads = data.map((lead) => {
        const dateValue = lead.date || lead.createdAt || lead.created_at;
        return {
          _id: lead._id || lead.id,
          name: lead.name || "Unknown",
          mobile: lead.phone || lead.mobile || "",
          service: lead.service || "General",
          status: lead.status ? lead.status : "Incoming",
          source: lead.source || "Unknown",
          address: lead.address || "",
          createdAt: dateValue,
          updatedAt: lead.updatedAt,
          assignedTo: lead.assignedTo,
        };
      });

      const sortedLeads = mappedLeads.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setLeads(sortedLeads);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.token, leads.length]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // --- 2. Handlers ---
  const handleLeadAdded = (newLead) => {
    // Optimistic update or refetch
    fetchLeads();
    setIsModalOpen(false);
  };

  const handleDataChange = () => {
    fetchLeads();
  };

  // --- 3. Filter Logic ---
  const filteredLeads = useMemo(() => {
    if (activeTab === "All") return leads;
    return leads.filter((lead) => lead.status === activeTab);
  }, [leads, activeTab]);

  // --- 4. Counts Logic ---
  const counts = useMemo(() => {
    const stats = { "All": leads.length };
    leads.forEach((lead) => {
      const s = lead.status;
      if (s) stats[s] = (stats[s] || 0) + 1;
    });
    return stats;
  }, [leads]);

  // --- 5. Render ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans w-full overflow-x-hidden">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <LeadHeader onAddClick={() => setIsModalOpen(true)} />

        {/* Stats Section */}
        <LeadStats leads={leads} />

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Tabs - Sticky Header */}
          <div className="p-1 sm:p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <LeadTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              counts={counts}
            />
          </div>

          {/* Table Container */}
          <div className="relative min-h-[400px]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                <p className="text-slate-500 font-medium animate-pulse">Syncing leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                {activeTab === "All" ? (
                  <LeadEmptyState onAddClick={() => setIsModalOpen(true)} />
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <Inbox className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No {activeTab} Leads</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                      There are currently no leads marked as "{activeTab}".
                    </p>
                    <button
                      onClick={() => setActiveTab("All")}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                    >
                      View all leads
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-0 sm:p-4">
                <LeadTable
                  filteredLeads={filteredLeads}
                  onDataChange={handleDataChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddLeadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleLeadAdded}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadDashboard;