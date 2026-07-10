import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import api from "../../../api/api"; 
import { useAuthStore } from "../../../store/authStore"; 
import ProfileDetails from "./Profile/ProfileDetails"; 

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser?.token) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(api.User.GetOwnProfile, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authUser.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile configuration");
        
        const data = await res.json();
        const profile = data.data;
        const teamHeadName = profile.teamHead?.name || "No Team Head";
        setUserData({ ...profile, teamHeadName });

      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser?.token]);

  // --- Loading UI ---
  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your profile...</p>
      </div>
    );

  // --- Error UI ---
  if (error)
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-red-800 font-semibold text-lg mb-2">Unable to Load Profile</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <ProfileDetails initialUser={userData} />
    </div>
  );
}