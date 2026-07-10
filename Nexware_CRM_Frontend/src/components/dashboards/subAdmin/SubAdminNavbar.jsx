import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { Menu, Settings, LogOut, ChevronDown, User } from "lucide-react";
import api from "../../../api/api";

export default function SubAdminNavbar({ title = "", subtitle = "", onMenuClick }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false); 
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Zustand Selectors
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  // --- 1. DATA SYNC ON MOUNT ---
  // Ensures data is fresh on page refresh (F5)
  useEffect(() => {
    const syncUserData = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch(api.User.GetOwnProfile, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        
        if (res.ok && data.data) {
          const isDifferent = 
            data.data.name !== user.name || 
            data.data.email !== user.email || 
            data.data.avatar !== user.avatar;

          if (isDifferent) {
            setUser(data.data);
          }
        }
      } catch (err) {
        console.error("Background sync failed:", err);
      }
    };
    
    syncUserData();
  }, []); 

  // --- 2. CLICK OUTSIDE LISTENER ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // --- 3. HELPER HANDLERS ---
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setOpen(false);
  };

  const handleProfileNav = () => {
    navigate("/sub-admin/profile");
    setOpen(false);
  };

  const getInitials = () => user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="w-full py-4 px-6 md:px-10 bg-transparent relative z-40">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        
        {/* LEFT: Title & Toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm md:hidden transition-all duration-200"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>}
          </div>
        </div>

        {/* RIGHT: Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className={`
              flex items-center gap-3 p-1.5 pr-3 rounded-full border transition-all duration-200 group
              ${open ? "bg-white shadow-sm border-gray-200" : "border-transparent hover:bg-white/60 hover:border-gray-100"}
            `}
            aria-expanded={open}
            aria-haspopup="true"
          >
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white overflow-hidden shrink-0">
              {user?.avatar && !imgError ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)} // Fallback if image breaks
                />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>
            
            {/* Text & Icon (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-left flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">{user?.name || "User"}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">{user?.role || "Admin"}</p>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180 text-indigo-500" : ""}`} 
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {open && (
            <div className="absolute right-0 mt-3 w-72 rounded-2xl shadow-xl bg-white border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 origin-top-right">
              
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-50 mb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                   {getInitials()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={handleProfileNav}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3"
                >
                  <Settings size={18} className="text-gray-400 group-hover:text-indigo-600" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}