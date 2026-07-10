import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "../../../../api/api";
import { useAuthStore } from "../../../../store/authStore";
import {
  X,
  User,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  ChevronDown,
  Loader2,
  Sparkles,
  FileSpreadsheet,
  UploadCloud,
  FileCheck,
  Building2 // Icon for Address/Company
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Reusable Input Component (Matches your AddUserModal style) ---
const InputField = ({ icon: Icon, label, required, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-gray-400"
      />
    </div>
  </div>
);

const AddLeadModal = ({ isOpen, onClose, onSubmit }) => {
  const { user: authUser } = useAuthStore();
  const fileInputRef = useRef(null);
  
  // --- State (Logic Unchanged) ---
  const [activeTab, setActiveTab] = useState("single");
  const [users, setUsers] = useState([]);
  const [lead, setLead] = useState({
    name: "",
    phone: "",
    service: "",
    address: "",
    source: "",
    status: "Ring",
    assignedTo: "",
    remarks: "",
  });
  const [excelFile, setExcelFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    "Ring",
    "Follow Up",
    "Sale Done",
    "Not Interested",
    "Switch Off",
    "Incoming",
  ];

  // --- Logic ---
  const fetchUsers = async () => {
    try {
      const token = authUser?.token;
      if (!token) return;
      const res = await axios.get(api.User.AdminGetAll, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("User fetch error:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setActiveTab("single");
      setExcelFile(null);
      setLead({
        name: "",
        phone: "",
        service: "",
        address: "",
        source: "",
        status: "Ring",
        assignedTo: "",
        remarks: "",
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setExcelFile(file);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "single") await handleSubmitSingle();
    else await handleSubmitBulk();
  };

  const handleSubmitSingle = async () => {
    try {
      setIsSubmitting(true);
      const token = authUser?.token;
      if (!token) return alert("Unauthorized!");

      const body = {
        name: lead.name.trim(),
        phone: lead.phone.trim(),
        service: lead.service.trim(),
        address: lead.address.trim() || undefined,
        source: lead.source.trim() || undefined,
        status: lead.status,
        remarks: lead.remarks.trim() || undefined,
        assignedTo: lead.assignedTo || undefined,
      };

      const res = await axios.post(api.Leads.Create, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSubmit?.(res.data?.data || res.data);
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(", ") || err.response?.data?.message;
      alert(msg || "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBulk = async () => {
    if (!excelFile) return alert("Please select a file first.");
    try {
      setIsSubmitting(true);
      const token = authUser?.token;
      if (!token) return alert("Unauthorized!");

      const formData = new FormData();
      formData.append("excel", excelFile);

      const res = await axios.post(api.Leads.UploadExcel, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        },
      });

      alert(`Success! ${res.data.inserted} leads added.`);
      onSubmit?.(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to upload excel";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          
          {/* --- Header (Fixed) --- */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                Add Leads
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 ml-9">
                Create a new prospect or upload a list.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* --- Tab Switcher --- */}
          <div className="px-6 pt-4 pb-0 bg-white shrink-0">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setActiveTab("single")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "single"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User className="w-4 h-4" /> Single Entry
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "bulk"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Bulk Upload
              </button>
            </div>
          </div>

          {/* --- Scrollable Content Area --- */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="lead-form" onSubmit={handleFinalSubmit} className="space-y-6">
              
              {activeTab === "single" ? (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                      label="Full Name" 
                      name="name" 
                      value={lead.name} 
                      onChange={handleChange} 
                      required 
                      icon={User} 
                      placeholder="e.g. John Doe" 
                    />
                    <InputField 
                      label="Phone" 
                      name="phone" 
                      value={lead.phone} 
                      onChange={handleChange} 
                      required 
                      icon={Phone} 
                      placeholder="e.g. 9876543210" 
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                      label="Service Interest" 
                      name="service" 
                      value={lead.service} 
                      onChange={handleChange} 
                      icon={Briefcase} 
                      placeholder="e.g. Web Development" 
                    />
                    <InputField 
                      label="Source" 
                      name="source" 
                      value={lead.source} 
                      onChange={handleChange} 
                      icon={FileText} 
                      placeholder="e.g. Instagram, Referral" 
                    />
                  </div>

                  {/* Row 3 - Address & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField 
                      label="Address" 
                      name="address" 
                      value={lead.address} 
                      onChange={handleChange} 
                      icon={Building2} 
                      placeholder="e.g. Mumbai, India" 
                    />

                    {/* Custom Select for Status */}
                    <div className="space-y-1.5 w-full">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Initial Status
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                           <Sparkles className="w-5 h-5" />
                        </div>
                        <select
                          name="status"
                          value={lead.status}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Row 4 - Assign To */}
                  <div className="space-y-1.5 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Assign To Team Member
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                         <User className="w-5 h-5" />
                      </div>
                      <select
                        name="assignedTo"
                        value={lead.assignedTo}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">-- Select Member --</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1.5 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      rows="3"
                      value={lead.remarks}
                      onChange={handleChange}
                      placeholder="Add any additional notes here..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none placeholder:text-gray-400"
                    />
                  </div>

                </motion.div>
              ) : (
                // ---------------- BULK UPLOAD UI ----------------
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-60 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group ${
                      excelFile 
                        ? "bg-green-50/50 border-green-400" 
                        : "bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />

                    {excelFile ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                          <FileCheck className="w-8 h-8" />
                        </div>
                        <div className="text-center px-6">
                          <p className="text-sm font-bold text-gray-800 break-all line-clamp-2">
                            {excelFile.name}
                          </p>
                          <p className="text-xs text-green-600 mt-1 font-medium">Ready to upload</p>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExcelFile(null);
                            if(fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="px-4 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-full hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                        >
                          Change File
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Click to upload Excel</p>
                          <p className="text-xs text-gray-400 mt-1">Supported: .xlsx, .xls</p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* --- Footer (Fixed) --- */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200/50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lead-form"
              disabled={isSubmitting || (activeTab === "bulk" && !excelFile)}
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                activeTab === "bulk" ? "Upload Excel" : "Create Lead"
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddLeadModal;