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

        // 1. Fetch Profile
        const res = await fetch(api.User.GetOwnProfile, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authUser.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");
        
        const data = await res.json();
        const profile = data.data;

        // 2. Optimized Team Head Logic
        // If backend sends full object -> use it. If ID -> fetch it.
        let teamHeadName = "No Team Head";

        if (profile.teamHead?.name) {
          teamHeadName = profile.teamHead.name; // Use existing data (Optimized)
        } else if (profile.teamHeadId) {
          // Fallback: Fetch if only ID is provided
          try {
            const headRes = await fetch(`${api.User.AdminGetAll}/${profile.teamHeadId}`, {
              method: "GET",
              headers: { Authorization: `Bearer ${authUser.token}` },
            });
            if (headRes.ok) {
              const headData = await headRes.json();
              teamHeadName = headData.data?.name || "Unknown";
            }
          } catch (e) {
            console.warn("Head fetch failed", e);
          }
        }

        setUserData({ ...profile, teamHeadName });

      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser?.token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 max-w-sm text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-gray-800 font-medium mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <ProfileDetails user={userData} />
    </div>
  );
}