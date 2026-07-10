import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LoginForm from "./components/login/LoginForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./components/dashboards/admin/AdminDashboard";
import LeadDashboard from "./components/dashboardsPages/admin/LeadDashboard";
import UsersPage from "./components/dashboardsPages/admin/UsersPage";
import ProductsPage from "./components/dashboardsPages/admin/ProductsPage";
import OrdersPage from "./components/dashboardsPages/admin/OrdersPage";
import ProfilePage from "./components/dashboardsPages/admin/ProfilePage";

import AgentLayout from "./layouts/AgentLayout";
import SubAdminLayout from "./layouts/SubAdminLayout";
import TeamHeadLayout from "./layouts/TeamHeadLayout";

import AgentProfile from "./components/dashboardsPages/agent/ProfilePage";
import AgentProductPage from "./components/dashboardsPages/agent/ProductsPage";
import AgentOrdersPage from "./components/dashboardsPages/agent/OrdersPage";
import AgentLeadsPage from "./components/dashboardsPages/agent/LeadDashboard";
import AgentDashboard from "./components/dashboards/agent/AgentDashboard";

import SubAdminDashboard from "./components/dashboards/subAdmin/SubAdminDashboard";
import SubAdminProfile from "./components/dashboardsPages/subAdmin/ProfilePage";
import SubAdminUserManagePage from "./components/dashboardsPages/subAdmin/UsersPage";
import SubAdminProductsPage from "./components/dashboardsPages/subAdmin/ProductsPage";
import SubAdminOrdersPage from "./components/dashboardsPages/subAdmin/OrdersPage";
import SubAdminLeadsPage from "./components/dashboardsPages/subAdmin/LeadDashboard";

import TeamHeadDashboard from "./components/dashboards/teamhead/TeamHeadDashboard";
import TeamHeadProfile from "./components/dashboardsPages/teamhead/ProfilePage";
import TeamHeadManagePage from "./components/dashboardsPages/teamhead/UsersPage";
import TeamHeadProductsPage from "./components/dashboardsPages/teamhead/ProductsPage";
import TeamHeadOrdersPage from "./components/dashboardsPages/teamhead/OrdersPage";
import TeamHeadLeadsPage from "./components/dashboardsPages/teamhead/LeadDashboard";


import Loader from "./components/ui/Loader";

export default function App() {
  const [isLoading, setIsLoading] = useState(window.location.pathname === "/");
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  if (isLoading) {
    return (
      <Loader
        type="fullscreen"
        fullScreenState={true}
        color="text-indigo-600"
        text="Loading Assets..."
      />
    );
  }
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<LeadDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={["agent"]} />}>
          <Route path="/agent" element={<AgentLayout />}>
            <Route index element={<AgentDashboard />} />
            <Route path="profile" element={<AgentProfile />} />
            <Route path="products" element={<AgentProductPage />} />
            <Route path="orders" element={<AgentOrdersPage />} />
            <Route path="leads" element={<AgentLeadsPage />} />
          </Route>
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={["teamhead"]} />}>
          <Route path="/team-head" element={<TeamHeadLayout />}>
            <Route index element={<TeamHeadDashboard />} />
            <Route path="users" element={<TeamHeadManagePage />} />
            <Route path="profile" element={<TeamHeadProfile />} />
            <Route path="products" element={<TeamHeadProductsPage />} />
            <Route path="orders" element={<TeamHeadOrdersPage />} />
            <Route path="leads" element={<TeamHeadLeadsPage />} />
          </Route>
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={["subadmin"]} />}>
          <Route path="/sub-admin" element={<SubAdminLayout />}>
            <Route index element={<SubAdminDashboard />} />
            <Route path="users" element={<SubAdminUserManagePage />} />
            <Route path="profile" element={<SubAdminProfile />} />
            <Route path="products" element={<SubAdminProductsPage />} />
            <Route path="orders" element={<SubAdminOrdersPage />} />
            <Route path="leads" element={<SubAdminLeadsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}