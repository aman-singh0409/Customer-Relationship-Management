import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Briefcase, Activity, Users, Save, X, Edit2, CheckCircle } from "lucide-react";
import ProfileImage from "./ProfileImage"; // Ensure this component exists
import ProfileField from "./ProfileField"; // Ensure this component exists
import api from "../../../../api/api";
import { useAuthStore } from "../../../../store/authStore";
import { useNavigate } from "react-router-dom";

const ProfileDetails = ({ initialUser }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  
  // State 1: Form Data
  const [formData, setFormData] = useState(initialUser);
  
  // State 2: UI Control (Issue 2 Fix: Edit Mode Toggle)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setFormData(initialUser);
  }, [initialUser]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(initialUser); // Revert changes
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(api.User.UpdateOwnProfile, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser?.token}`,
        },
        // We only send editable fields. We do NOT send teamHead (it's read-only).
        body: JSON.stringify({
          id: formData._id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Update failed");

      // Merge response data (preserving the existing teamHeadName)
      setFormData(prev => ({ ...prev, ...data.data })); 
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

    } catch (error) {
      setMessage({ type: "error", text: error.message || "Something went wrong" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account settings.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isEditing ? (
            <>
              <button onClick={() => navigate(-1)} className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50">Back</button>
              <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                <Edit2 size={16} /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCancel} disabled={isSaving} className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveChanges} disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-70">
                {isSaving ? "Saving..." : <><Save size={16} /> Save Changes</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20}/> : <X size={20}/>}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 md:p-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Avatar */}
          <div className="lg:w-1/4 flex flex-col items-center lg:items-start space-y-6">
            <ProfileImage name={formData.name} avatarUrl={formData.avatar} isEditing={isEditing} />
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
              <p className="text-indigo-600 font-medium text-sm capitalize">{formData.role}</p>
            </div>
          </div>

          {/* Right: Fields */}
          <div className="lg:w-3/4 flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <ProfileField label="Full Name" value={formData.name} icon={User} disabled={!isEditing} onChange={(e) => handleChange('name', e.target.value)} />
            <ProfileField label="Email Address" value={formData.email} icon={Mail} disabled={!isEditing} onChange={(e) => handleChange('email', e.target.value)} />
            <ProfileField label="Phone Number" value={formData.phone} icon={Phone} disabled={!isEditing} onChange={(e) => handleChange('phone', e.target.value)} />
            
            {/* Read Only Fields */}
            <ProfileField label="Role" value={formData.role} icon={Briefcase} disabled={true} />
            <ProfileField label="Status" value={formData.status} icon={Activity} disabled={true} />
            
            {/* Team Head - Displaying the resolved name */}
            <ProfileField 
              label="Team Head" 
              value={formData.teamHeadName} 
              icon={Users} 
              disabled={true}
              helperText="Assigned by Admin" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;