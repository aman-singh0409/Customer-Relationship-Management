import React, { useState } from "react";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import axios from "axios";
import api from "../../../../api/api";
import { useAuthStore } from "../../../../store/authStore";

const ChangePasswordModal = ({ onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Logic Preserved exactly as requested
  const { id, token } = useAuthStore.getState().user;

  const handleSave = async () => {
    if (!id) { alert("User ID is missing!"); return; }
    if (!newPassword) { alert("Password cannot be empty!"); return; }

    setLoading(true);
    try {
      await axios.put(api.User.AdminUpdateAnyUserPassword, 
        { id: id, newPassword: newPassword },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      alert("Password updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update password:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-50 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Lock size={20} />
             </div>
             <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
             <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;