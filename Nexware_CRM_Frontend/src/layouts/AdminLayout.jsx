import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/dashboards/admin/AdminSidebar";
import AdminNavbar from "../components/dashboards/admin/AdminNavbar";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="hidden md:block w-64 fixed left-0 top-0 h-screen bg-white shadow-lg z-30">
        <AdminSidebar />
      </div>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={`
          fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300 ease-in-out md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <AdminSidebar close={() => setOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <AdminNavbar onMenuClick={() => setOpen(true)} />
        </div>
        <main className="p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}