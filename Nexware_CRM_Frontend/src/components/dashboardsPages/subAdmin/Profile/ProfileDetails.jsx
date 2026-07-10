import React, { useState, useEffect } from "react";
import ProfileImage from "./ProfileImage";
import ProfileField from "./ProfileField";
import ChangePasswordModal from "./ChangePasswordModal";
import { User, Mail, Phone, Briefcase, Activity, Users, Edit2, Save, X, ShieldCheck } from "lucide-react";
import api from "../../../../api/api";
import { useAuthStore } from "../../../../store/authStore";
import { useNavigate } from "react-router-dom";

const ProfileDetails = ({ user }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  
  // State for data
  const [profile, setProfile] = useState(user);
  
  // State for UI Logic (Fixing Issue 3)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  // Handle Input Change
  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Cancel Edit - Reverts data
  const handleCancel = () => {
    setProfile(user); // Reset to original prop data
    setIsEditing(false);
  };

  // Save Changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(api.User.UpdateOwnProfile, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser?.token}`,
        },
        body: JSON.stringify({
          id: profile._id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update");

      setProfile({ ...profile, ...data.data }); // Update local state
      setIsEditing(false); // Turn off edit mode
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and security.</p>
        </div>

        {/* Action Buttons: Logic to toggle Edit/Save */}
        <div className="flex gap-3 w-full sm:w-auto">
          {!isEditing ? (
            <>
              <button 
                onClick={() => navigate(-1)} 
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleCancel} 
                disabled={isSaving}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges} 
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-70 min-w-[140px]"
              >
                {isSaving ? "Saving..." : <><Save size={16} /> Save Changes</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left: Profile Image */}
            <div className="lg:w-1/4 flex flex-col items-center lg:items-start space-y-6">
              <ProfileImage name={profile.name} avatarUrl={profile.avatar} isEditing={isEditing} />
              <div className="text-center lg:text-left">
                 <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                 <p className="text-indigo-600 font-medium text-sm capitalize">{profile.role}</p>
              </div>
            </div>

            {/* Right: Fields */}
            <div className="lg:w-3/4 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-indigo-500"/> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Editable Fields (Only when isEditing is true) */}
                <ProfileField label="Full Name" value={profile.name} icon={User} disabled={!isEditing} onChange={(e) => handleChange('name', e.target.value)} />
                <ProfileField label="Email Address" value={profile.email} icon={Mail} disabled={!isEditing} onChange={(e) => handleChange('email', e.target.value)} />
                <ProfileField label="Phone Number" value={profile.phone} icon={Phone} disabled={!isEditing} onChange={(e) => handleChange('phone', e.target.value)} />
                
                {/* Always Read-Only Fields */}
                <ProfileField label="Role" value={profile.role} icon={Briefcase} disabled={true} />
                <ProfileField label="Status" value={profile.status} icon={Activity} disabled={true} />
                <ProfileField label="Team Head" value={profile.teamHeadName} icon={Users} disabled={true} helperText="Assigned by Admin" />
              </div>

              {/* Security Section */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <ShieldCheck className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Password & Security</h3>
                        <p className="text-xs text-gray-500">Manage your account password</p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={() => setShowChangePassword(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {showChangePassword && (
                <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;