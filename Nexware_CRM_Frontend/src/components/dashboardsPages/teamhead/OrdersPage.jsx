import React, { useEffect, useState } from "react";
import OrderCard from "./orderPage/OrderCard";
import OrderTable from "./orderPage/OrderTable";
import OrderDetailsModal from "./orderPage/OrderDetailsModal";
import OrderHeader from "./orderPage/OrderHeader";
import OrderStats from "./orderPage/OrderStats";
import AddNewOrder from "./orderPage/AddNewOrder";
import api from "../../../api/api";
import axios from "axios";
import { useAuthStore } from "../../../store/authStore";

const OrdersPage = () => {
  // State Management
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("table"); 

  // Modal & Loading States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openAddOrder, setOpenAddOrder] = useState(false);

  const { user: authUser } = useAuthStore();

  // 1. Fetch All Orders (Real Data)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(api.Order.GetAll, {
        headers: { Authorization: `Bearer ${authUser?.token}` },
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("API Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch on Mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Handle Click (Fetch Single Order Details & Open Modal)
  const handleOrderClick = async (orderId) => {
    if (!orderId) return;

    try {
      // Optional: Add specific loading state for modal opening if needed
      const response = await axios.get(`${api.Order.GetOne}?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${authUser?.token}` },
      });

      if (response.data.success) {
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching specific order details", error);
      alert("Failed to fetch order details.");
    }
  };

  return (
    <>
      {/* Top Header */}
      <OrderHeader onAddClick={() => setOpenAddOrder(true)} />

      {/* 🔥 CRITICAL UPDATE: 
          Pass the 'orders' state to OrderStats so charts calculate based on real API data 
      */}
      <OrderStats orders={orders} />

      <div className="p-8 min-h-screen bg-slate-50">
        {/* Controls Section (Title + View Toggle) */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders</h1>
            <p className="text-slate-500 text-sm mt-1">Manage, track and update your customer orders</p>
          </div>

          <div className="flex bg-white p-1.5 border border-slate-200 rounded-lg shadow-sm">
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 text-sm rounded-md font-semibold transition-all ${view === "table" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("cards")}
              className={`px-4 py-2 text-sm rounded-md font-semibold transition-all ${view === "cards" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}
            >
              Grid View
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Content Area */}
        {!loading && (
          <>
            {/* VIEW: TABLE */}
            {view === "table" && (
              <OrderTable
                orders={orders}
                onRefresh={fetchOrders}
                // When row clicked, fetch specific details
                onRowClick={(order) => handleOrderClick(order._id || order.id)}
              />
            )}

            {/* VIEW: GRID CARDS */}
            {view === "cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.map((o) => (
                  <OrderCard
                    key={o._id || o.id}
                    order={o}
                    // When card clicked, fetch specific details
                    onClick={() => handleOrderClick(o._id || o.id)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No orders found. Create one to get started.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Add New Order Modal */}
      {openAddOrder && (
        <AddNewOrder
          onClose={() => setOpenAddOrder(false)}
          onSuccess={() => {
            setOpenAddOrder(false);
            fetchOrders(); // Refresh list to show new order
          }}
        />
      )}

      {/* 2. Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}

          // 🔥 THIS IS THE MISSING PIECE for auto-refresh:
          onOrderUpdated={fetchOrders}
        />
      )}
    </>
  );
};

export default OrdersPage;