import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../../api/api";
import {
  X,
  User,
  Phone,
  MapPin,
  Tag,
  Briefcase,
  Mail,
  CheckCircle2,
  Trash2,
  Save,
  Loader2,
  ChevronDown,
  CalendarDays,
  Edit,
  RotateCcw,
  UserPlus,
  Clock,
  Filter
} from "lucide-react";
import { useAuthStore } from "../../../../store/authStore";
import { getStatusColor, getStatusIcon } from "./leadUtils";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER: DATE FORMATTER ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// --- HELPER: INFO CARD ---
const InfoCard = ({
  icon: Icon,
  iconColor,
  label,
  value,
  displayValue,
  subValue,
  isEditable,
  name,
  onChange,
  type = "text",
  options
}) => {
  const textColorClass = iconColor.replace("bg-", "text-");

  const getReadText = () => {
    if (displayValue) return displayValue;
    if (type === "select" && options) {
       const found = options.find(opt => opt.value === value);
       if (found) return found.label;
    }
    return value;
  };

  return (
    <div className={`relative flex flex-col justify-center px-4 py-3 rounded-xl border transition-all duration-300 ${
      isEditable 
        ? "bg-white border-slate-300 shadow-sm ring-4 ring-slate-50" 
        : "bg-slate-50/50 border-transparent hover:bg-slate-100/50"
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${textColorClass} opacity-70`} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>

      <div className="w-full relative min-h-6">
        {isEditable ? (
          type === "select" ? (
            <div className="relative">
              <select
                name={name}
                value={value || ""}
                onChange={onChange}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none appearance-none py-1 pr-6 cursor-pointer border-b border-slate-200 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>Select {label}</option>
                {options && options.map((opt, index) => {
                  const optValue = typeof opt === 'object' ? opt.value : opt;
                  const optLabel = typeof opt === 'object' ? opt.label : opt;
                  return (
                    <option key={`${optValue}-${index}`} value={optValue}>
                      {optLabel}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          ) : (
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none placeholder-slate-300 py-1 border-b border-slate-200 focus:border-blue-500 transition-colors"
              placeholder={`Enter ${label}...`}
              autoComplete="off"
            />
          )
        ) : (
          <p className="text-sm font-semibold text-slate-700 truncate py-1">
            {getReadText() || <span className="text-slate-400 font-normal italic text-xs">Not Provided</span>}
          </p>
        )}
      </div>

      {subValue && !isEditable && (
        <p className="text-xs text-slate-400 mt-1 pl-0">{subValue}</p>
      )}
    </div>
  );
};

// --- COMPONENT: POPUP DETAILS ---
const LeadDetailsPopup = ({
  leadId,
  onClose,
  token,
  isUserAdmin,
  onSuccess,
}) => {
  const [leadDetails, setLeadDetails] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const statusOptions = [
    "Ring", "Follow Up", "Sale Done", "Not Interested", "Switch Off", "Incoming"
  ];

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(api.Leads.GetDetails(leadId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setLeadDetails(data);
        resetForm(data);

        if (isUserAdmin && api.User?.AdminGetAll) {
            try {
                const userRes = await axios.get(api.User.AdminGetAll, {
                headers: { Authorization: `Bearer ${token}` },
                });
                const rawUsers = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);
                const userOptions = rawUsers.map(u => ({ label: u.name, value: u._id }));
                setAssignees(userOptions);
            } catch (userErr) { console.error("User fetch error:", userErr); }
        }

      } catch (err) {
        console.error(err);
        alert("Failed to load lead details.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (leadId && token) initData();
  }, [leadId, token, isUserAdmin]);

  const resetForm = (data) => {
    setFormData({
      name: data.name || "",
      mobile: data.mobile || data.phone || "",
      address: data.address || "",
      service: data.service || "",
      source: data.source || "",
      status: statusOptions.includes(data.status) ? data.status : "Ring",
      assignedTo: typeof data.assignedTo === 'object' ? data.assignedTo?._id : data.assignedTo || "",
      remarks: data.remarks || ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleEdit = () => {
    if (isEditing && leadDetails) resetForm(leadDetails);
    setIsEditing(!isEditing);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${leadDetails?.name}?`)) return;
    try {
      setActionLoading(true);
      await axios.delete(api.Leads.AdminDelete, {
        headers: { Authorization: `Bearer ${token}` },
        data: { leadId: leadId },
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting lead");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setActionLoading(true);
      const payload = {
        id: leadId,
        status: formData.status,
        remarks: formData.remarks
      };

      if (isUserAdmin) {
        payload.name = formData.name;
        payload.phone = formData.mobile;
        payload.service = formData.service;
        payload.address = formData.address;
        payload.source = formData.source;
        if (formData.assignedTo && typeof formData.assignedTo === 'string' && formData.assignedTo.trim().length > 5) {
            payload.assignedTo = formData.assignedTo;
        }
      }

      await axios.put(api.Leads.Update, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedDetails = { 
        ...leadDetails, 
        ...payload, 
        updatedAt: new Date().toISOString(),
        assignedTo: assignees.find(a => a.value === payload.assignedTo) 
          ? { _id: payload.assignedTo, name: assignees.find(a => a.value === payload.assignedTo).label }
          : leadDetails.assignedTo
      };
      
      setLeadDetails(updatedDetails);
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Update failed";
      alert(`Error: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!leadId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-blue-50 text-blue-600`}>
                {leadDetails?.name ? leadDetails.name.charAt(0).toUpperCase() : <User className="w-5 h-5"/>}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                {loading ? "Loading..." : formData.name}
              </h2>
              <div className="flex items-center gap-2">
                 <p className="text-slate-500 text-xs font-medium">Lead Details</p>
                 {!loading && (
                   <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getStatusColor(formData.status)}`}>
                     {formData.status}
                   </span>
                 )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {!loading && !isEditing && (
                <button 
                  onClick={toggleEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
             )}
            <button 
              onClick={onClose} 
              className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="mt-4 text-sm font-medium text-slate-500">Retrieving details...</p>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-3 text-blue-800 text-sm font-medium mb-6"
                  >
                    <Edit className="w-4 h-4" />
                    {isUserAdmin 
                        ? "Editing Mode: You have full access to update this lead." 
                        : "Editing Mode: You can only update Status and Remarks."
                    }
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Personal Info */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard 
                    icon={User} iconColor="bg-blue-500" label="Full Name" 
                    isEditable={isEditing && isUserAdmin} 
                    name="name" value={formData.name} onChange={handleChange} 
                  />
                  <InfoCard 
                    icon={Phone} iconColor="bg-emerald-500" label="Mobile Number" 
                    isEditable={isEditing && isUserAdmin} 
                    name="mobile" value={formData.mobile} onChange={handleChange} 
                  />
                  <InfoCard 
                    icon={MapPin} iconColor="bg-rose-500" label="Address" 
                    isEditable={isEditing && isUserAdmin} 
                    name="address" value={formData.address} onChange={handleChange} 
                  />
                  <InfoCard icon={Mail} iconColor="bg-violet-500" label="Email" value={leadDetails?.email} isEditable={false} />
                </div>
              </div>

              {/* Deal & System Info */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2 flex items-center gap-2">
                  Deal & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard 
                    icon={Briefcase} iconColor="bg-orange-500" label="Service Interested" 
                    isEditable={isEditing && isUserAdmin} 
                    name="service" value={formData.service} onChange={handleChange} 
                  />
                  <InfoCard 
                    icon={Tag} iconColor="bg-indigo-500" label="Lead Source" 
                    isEditable={isEditing && isUserAdmin} 
                    name="source" value={formData.source} onChange={handleChange} 
                  />
                  <InfoCard 
                    icon={User} 
                    iconColor="bg-teal-500" 
                    label="Assigned Agent" 
                    isEditable={isEditing && isUserAdmin} 
                    type="select" 
                    options={assignees} 
                    name="assignedTo" 
                    value={formData.assignedTo} 
                    displayValue={leadDetails?.assignedTo?.name} 
                    onChange={handleChange} 
                  />
                  <InfoCard 
                    icon={CheckCircle2} 
                    iconColor="bg-blue-600" 
                    label="Current Status" 
                    isEditable={isEditing} 
                    type="select" 
                    options={statusOptions} 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                  />
                </div>
                
                {/* System Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <InfoCard 
                        icon={UserPlus} iconColor="bg-slate-500" label="Created By" 
                        value={leadDetails?.createdBy?.name || "Unknown"} isEditable={false} 
                    />
                    <InfoCard 
                        icon={CalendarDays} iconColor="bg-slate-500" label="Created On" 
                        value={formatDate(leadDetails?.createdAt)} isEditable={false} 
                    />
                    <InfoCard 
                        icon={Clock} iconColor="bg-slate-500" label="Last Updated" 
                        value={formatDate(leadDetails?.updatedAt)} isEditable={false} 
                    />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2 flex items-center gap-2">
                  Remarks
                </h3>
                <div className={`rounded-xl p-1 transition-all ${
                  isEditing 
                  ? "bg-white border border-slate-300 focus-within:ring-4 focus-within:ring-blue-500/10" 
                  : "bg-slate-50 border border-transparent"
                }`}>
                  <textarea
                    disabled={!isEditing}
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className={`w-full bg-transparent border-none rounded-lg p-4 text-sm text-slate-700 focus:ring-0 min-h-[100px] resize-y ${
                      !isEditing ? "cursor-default text-slate-600" : ""
                    }`}
                    placeholder={isEditing ? "Add important notes here..." : "No remarks added."}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 z-10 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          >
             <button
               onClick={toggleEdit}
               disabled={actionLoading}
               className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
             >
               <RotateCcw className="w-4 h-4" />
               Cancel
             </button>
             <button
               onClick={handleUpdate}
               disabled={loading || actionLoading}
               className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all transform active:scale-95 disabled:opacity-70"
             >
               {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Save Changes
             </button>
          </motion.div>
        ) : (
           <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center z-10 shrink-0">
              {/* Left Side: Delete Button (Admin Only) */}
              <div>
                {isUserAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="text-rose-500 hover:text-rose-700 text-sm font-semibold flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete Lead</span>
                  </button>
                )}
              </div>

              {/* Right Side: Close Button */}
              <button
                 onClick={onClose}
                 className="px-6 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
               >
                 Close
               </button>
           </div>
        )}
      </motion.div>
    </div>
  );
};

// --- LEAD TABLE COMPONENT ---
const LeadTable = ({ filteredLeads = [], onDataChange }) => {
  const { user: authUser } = useAuthStore();
  const isAdmin = authUser?.role === "admin";

  const [showAll, setShowAll] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  const safeLeads = Array.isArray(filteredLeads) ? filteredLeads : [];
  const displayedLeads = showAll ? safeLeads : safeLeads.slice(0, 5);

  const handlePopupSuccess = () => {
    if (onDataChange) {
      onDataChange();
    }
  };

  return (
    <div className="w-full space-y-6">
        
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow">
        <div className="w-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 pl-8 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[5%]">#</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[25%]">Lead Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[20%]">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[20%]">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[20%]">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right pr-8 w-[10%]">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedLeads.map((lead, index) => (
                <motion.tr
                  key={lead._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-slate-50/80 transition-all duration-200"
                >
                  <td className="px-6 py-4 pl-8 text-sm text-slate-400 font-mono">
                    {(index + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {lead.name || "Unknown"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium sm:hidden">
                          {lead.mobile || lead.phone || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-white border border-slate-100 px-3 py-1.5 rounded-full w-fit shadow-sm group-hover:border-blue-100 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {lead.mobile || lead.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      <span className="ml-2">{lead.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      if (!lead.createdAt) return <span className="text-slate-300">-</span>;
                      const d = new Date(lead.createdAt);

                      return (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                          <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 font-mono tracking-tight">
                            {d.toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right pr-8">
                    <button
                      className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all active:scale-95 bg-transparent border border-transparent hover:border-blue-100"
                      onClick={() => setSelectedLeadId(lead._id || lead.id)}
                      title="Edit Lead Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}

              {safeLeads.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-8 h-8 text-slate-200" />
                      <p className="text-sm">No leads found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {safeLeads.length > 5 && !showAll && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(true)}
            className="group flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
          >
            View All ({safeLeads.length})
            <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedLeadId && (
          <LeadDetailsPopup
            leadId={selectedLeadId}
            token={authUser?.token}
            isUserAdmin={isAdmin}
            onClose={() => setSelectedLeadId(null)}
            onSuccess={handlePopupSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadTable;