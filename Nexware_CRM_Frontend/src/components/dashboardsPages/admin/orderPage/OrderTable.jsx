import React, { useState, useEffect } from "react";
import {
  Eye,
  Trash2,
  MoreVertical,
  Calendar,
  CreditCard,
  Filter,
  Download,
  X,
  Search,
  Inbox
} from "lucide-react";
import api from "../../../../api/api";
import { useAuthStore } from "../../../../store/authStore";
import axios from "axios";

const OrderTable = ({ orders = [], onRowClick, onRefresh }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { user: authUser } = useAuthStore();

  // --- ADMIN CHECK ---
  const isAdmin = authUser?.role === 'admin';

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    }); 
  };

  // --- FILTER LOGIC ---
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      order.customerName?.toLowerCase().includes(lowerTerm) ||
      order.orderStatus?.toLowerCase().includes(lowerTerm) ||
      (order._id || order.id)?.toLowerCase().includes(lowerTerm) ||
      order.totalAmount?.toString().includes(lowerTerm)
    );
  });

  // --- EXPORT LOGIC ---
  const handleExportCSV = () => {
    if (orders.length === 0) return alert("No data to export");
    
    const headers = ["Order ID", "Customer Name", "Phone", "Status", "Amount", "Payment Mode", "Date"];
    const rows = filteredOrders.map(order => [
      order._id || order.id,
      `"${order.customerName}"`,
      order.phone || "N/A",
      order.orderStatus,
      order.totalAmount,
      order.paymentMode || "N/A",
      formatDate(order.createdAt)
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      setActiveMenuId(null);
      await axios.delete(api.Order.Delete, {
        headers: { Authorization: `Bearer ${authUser?.token}` },
        data: { orderId: id }, 
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete order");
    }
  };

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenuId && !event.target.closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  const getStatusConfig = (status) => {
    const s = status ? status.toLowerCase() : "";
    const map = {
      pending:   { bg: "#fff7ed", text: "#c2410c", border: "#ffedd5", dot: "#f97316" }, // Orange
      confirmed: { bg: "#eff6ff", text: "#1d4ed8", border: "#dbeafe", dot: "#3b82f6" }, // Blue
      packed:    { bg: "#f0f9ff", text: "#0369a1", border: "#e0f2fe", dot: "#0ea5e9" }, // Sky
      shipped:   { bg: "#eef2ff", text: "#4338ca", border: "#e0e7ff", dot: "#6366f1" }, // Indigo
      delivered: { bg: "#f0fdf4", text: "#15803d", border: "#dcfce7", dot: "#22c55e" }, // Green
      cancelled: { bg: "#fef2f2", text: "#b91c1c", border: "#fee2e2", dot: "#ef4444" }, // Red
    };
    return map[s] || { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" };
  };

  return (
    <>
      {/* Injecting CSS for hover states and transitions */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          
          .order-row { transition: all 0.2s ease; cursor: pointer; }
          .order-row:hover { background-color: #f8fafc; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
          
          .btn-hover:hover { background-color: #f1f5f9; color: #0f172a; }
          .btn-primary:hover { background-color: #1e293b; opacity: 0.95; }
          
          .menu-item:hover { background-color: #f8fafc; color: #0f172a; }
          .menu-item-delete:hover { background-color: #fef2f2; color: #ef4444; }
          
          .fade-in { animation: fadeIn 0.3s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      <div style={{ 
        background: "#ffffff", 
        borderRadius: "16px", 
        border: "1px solid #e2e8f0", 
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)", 
        width: "100%",        
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {/* Header */}
        <div style={{ 
          padding: "20px 24px", 
          borderBottom: "1px solid #f1f5f9", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",    
          gap: "16px",
          background: "#ffffff"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.5px" }}>
              Order Management
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
              Tracking {filteredOrders.length} active orders
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            
            {showFilter ? (
              <div className="fade-in" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "8px 30px 8px 32px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                    fontSize: "13px",
                    width: "220px",
                    transition: "border 0.2s",
                    color: "#334155"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                  autoFocus
                />
                <button 
                  onClick={() => { setSearchTerm(""); setShowFilter(false); }}
                  style={{ position: 'absolute', right: '8px', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowFilter(true)}
                className="btn-hover"
                style={{ 
                  padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", 
                  display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", 
                  border: "1px solid #e2e8f0", background: "white", color: "#64748b", transition: "all 0.2s"
                }}
              >
                <Filter size={14} /> Filter
              </button>
            )}

            <button 
              onClick={handleExportCSV}
              className="btn-primary"
              style={{ 
                padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", 
                display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", 
                background: "#0f172a", color: "white", border: "none",
                boxShadow: "0 2px 4px rgba(15, 23, 42, 0.1)"
              }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="custom-scrollbar" style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, textAlign: "right", paddingRight: "24px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                      <Inbox size={48} strokeWidth={1} />
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        {searchTerm ? `No results for "${searchTerm}"` : "No orders found"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderId = order._id || order.id;
                  const status = getStatusConfig(order.orderStatus);
                  const isMenuOpen = activeMenuId === orderId;

                  return (
                    <tr
                      key={orderId}
                      className="order-row"
                      onClick={() => !isMenuOpen && onRowClick && onRowClick(order)}
                    >
                      {/* ID */}
                      <td style={styles.td}>
                        <span style={{ 
                          background: "#f1f5f9", color: "#475569",
                          padding: "4px 8px", borderRadius: "6px", 
                          fontFamily: "monospace", fontSize: "11px", fontWeight: "600", border: "1px solid #e2e8f0" 
                        }}>
                          #{orderId.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Customer */}
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: "600", color: "#1e293b" }}>{order.customerName}</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{order.phone || "No phone"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={styles.td}>
                        <span style={{ 
                          background: status.bg, color: status.text, border: `1px solid ${status.border}`,
                          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", 
                          display: "inline-flex", alignItems: "center", gap: "6px" 
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status.dot }}></span>
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={styles.td}>
                         <span style={{ fontWeight: "600", color: "#334155" }}>₹{Number(order.totalAmount).toLocaleString()}</span>
                      </td>

                      {/* Payment */}
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <CreditCard size={13} color="#94a3b8" />
                            <span style={{ 
                                color: order.paymentStatus === "Paid" ? "#16a34a" : "#d97706", 
                                fontWeight: "500", fontSize: "12px" 
                            }}>
                                {order.paymentStatus}
                            </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b" }}>
                              <Calendar size={13} />
                              {formatDate(order.date || order.createdAt)}
                          </div>
                      </td>
                      
                      {/* Actions */}
                      <td style={{ ...styles.td, textAlign: "right", paddingRight: "24px" }}>
                        <div style={{ position: "relative" }} className="action-menu-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); 
                              setActiveMenuId(activeMenuId === orderId ? null : orderId);
                            }}
                            style={{
                                border: "1px solid transparent",
                                background: isMenuOpen ? "#eff6ff" : "transparent",
                                color: isMenuOpen ? "#3b82f6" : "#94a3b8",
                                borderRadius: "6px",
                                padding: "6px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {isMenuOpen && (
                            <div className="fade-in" style={{ 
                                position: "absolute", right: 0, top: "100%", marginTop: "6px", 
                                width: "160px", background: "white", borderRadius: "10px", 
                                border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", 
                                zIndex: 50, padding: "6px", overflow: 'hidden'
                            }}>
                              <div
                                className="menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  if (onRowClick) onRowClick(order);
                                }}
                                style={styles.menuItem}
                              >
                                <Eye size={14} /> View Details
                              </div>
                              
                              {/* DELETE BUTTON: ONLY SHOW FOR ADMINS */}
                              {isAdmin && (
                                <>
                                  <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }}></div>
                                  <div
                                    className="menu-item-delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(orderId);
                                    }}
                                    style={{ ...styles.menuItem, color: "#ef4444" }}
                                  >
                                    <Trash2 size={14} /> Delete Order
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Extracted styles for cleaner JSX
const styles = {
  th: { 
    padding: "14px 20px", 
    textAlign: "left", 
    fontSize: "11px", 
    fontWeight: "700", 
    color: "#64748b", 
    textTransform: "uppercase", 
    borderBottom: "1px solid #e2e8f0", 
    letterSpacing: "0.5px",
    whiteSpace: "nowrap" 
  },
  td: { 
    padding: "16px 20px", 
    fontSize: "13px", 
    color: "#334155", 
    verticalAlign: "middle", 
    whiteSpace: "nowrap",
    borderBottom: "1px solid #f8fafc"
  },
  menuItem: { 
    padding: "10px 12px", 
    fontSize: "13px", 
    fontWeight: "500",
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    borderRadius: "6px",
    transition: "background 0.2s"
  }
};

export default OrderTable;