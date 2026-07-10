import React, { useState, useEffect } from "react";
import {
  Shield,
  Briefcase,
  Headphones,
  Search,
  UserPlus,
  Loader2,
  Users as UsersIcon,
} from "lucide-react";

import StatsCard from "./userManagePage/StatsCard";
import UserCard from "./userManagePage/UserCard";
import AddUserModal from "./userManagePage/AddUserModal";
import UserEditModal from "./userManagePage/UserEditModal";
import api from "../../../api/api";
import { useAuthStore } from "../../../store/authStore";

const UsersPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // --- 1. ADD FIX: List update instantly when user is created ---
  const handleUserAdded = (newUser) => {
    // Naye user ko list ke top par add kar rahe hain
    setUsers((prevUsers) => [newUser, ...prevUsers]);
  };

  // --- 2. UPDATE FIX: List update instantly when user is edited ---
  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        // Agar ID match kare toh naya data lagao, nahi toh purana rehne do
        u._id === updatedUser._id ? updatedUser : u
      )
    );
  };

  // --- DELETE FIX: List update instantly ---
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(api.User.AdminDelete, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id: userId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        // Deleted user ko filter out kar rahe hain bina refresh kiye
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting user");
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const res = await fetch(api.User.AdminGetAll, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user?.token]);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term))
    );
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen space-y-8 pb-20 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Team Management
        </h1>
        <p className="text-gray-500">
          Manage your admins, team heads, and agents.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          count={users.length}
          icon={UsersIcon}
          color="indigo"
        />
        <StatsCard
          title="Subadmins"
          count={users.filter((u) => u.role === "subadmin").length}
          icon={Shield}
          color="emerald"
        />
        <StatsCard
          title="Team Heads"
          count={users.filter((u) => u.role === "teamhead").length}
          icon={Briefcase}
          color="amber"
        />
        <StatsCard
          title="Agents"
          count={users.filter((u) => u.role === "agent").length}
          icon={Headphones}
          color="rose"
        />
      </div>

      {/* Action Bar */}
      {/* Removed 'sticky', 'top-4', 'z-30'. Added 'mb-6' for spacing */}
      <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
        </div>

        {/* Add User Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow hover:shadow-lg transition-all active:scale-95 w-full md:w-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Users List */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 animate-pulse">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Loading team data...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filteredUsers.map((user) => (
              <div
                key={user._id || user.id}
                className="w-full bg-white/70 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl p-4 hover:shadow-lg transition-all"
              >
                <UserCard
                  user={user}
                  onEdit={(u) => setEditUser(u)}
                  onDelete={(id) => handleDeleteUser(id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-semibold text-lg">
              No members found
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              We couldn't find anyone matching "{search}"
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-indigo-600 font-medium hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}

      {editUser && (
        <UserEditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default UsersPage;