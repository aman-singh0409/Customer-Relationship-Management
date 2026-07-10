import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  Target,
  UserPen,
  X
} from "lucide-react";

export default function SubAdminSidebar({ close }) {
  const location = useLocation();
  
  const links = [
    { to: "/sub-admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/sub-admin/users", label: "Manage Users", icon: Users },
    { to: "/sub-admin/leads", label: "Leads", icon: Target },
    { to: "/sub-admin/products", label: "Products", icon: Package },
    { to: "/sub-admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/sub-admin/profile", label: "My Profile", icon: UserPen }
  ];

  return (
    <aside
      className="
        h-screen w-64 shrink-0 
        border-r border-[#0F2A53] shadow-xl relative
        /* Removed 'hidden md:block' so it can be rendered in mobile drawer */
      "
      style={{ background: "#163D7A" }}
    >
      <div className="p-6">
        
        {/* Logo Section with Close Button */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-md">
              <span className="font-bold text-[#163D7A]">CRM</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Sub Admin</div>
              <div className="text-[#BFD3FF] text-xs">Control Panel</div>
            </div>
          </div>

          {/* CLOSE BUTTON (Mobile Only) */}
          <button 
            onClick={close}
            className="md:hidden text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={close} 
              end={to === "/admin"} 
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium 
                  transition-all duration-200 relative group

                  ${
                    isActive
                      ? "bg-[#143B68] text-white shadow-md"
                      : "text-[#D6E5FF] hover:bg-[#143B68]/60 hover:text-white"
                  }
                `
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>

              {/* right accent highlight bar */}
              <span
                className={`
                  absolute right-0 top-0 h-full w-1 rounded-l-full 
                  transition-all duration-200 
                  ${location.pathname === to ? "bg-white" : "group-hover:bg-white/40"}
                `}
              />
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}