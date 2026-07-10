import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../../../../store/authStore";
import api from "../../../../api/api"; 

const AddNewOrder = ({ onClose, onSuccess }) => {
  const { user: authUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Dropdown Data
  const [products, setProducts] = useState([]);
  const [agents, setAgents] = useState([]);

  // CONSTANTS
  const ORDER_STATUSES = [
    "Pending", "Confirmed", "Packed", "Shipped", "In Transit", 
    "Out For Delivery", "Delivered", "RTO Initiated", "RTO Received", 
    "Returned", "Cancelled"
  ];

  const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];
  const PAYMENT_MODES = ["COD", "Partial Payment", "Full Payment"];

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    pincode: "",
    productId: "", 
    quantity: 1,
    priceAtOrderTime: "",
    agentId: "",
    awb: "", 
    paymentMode: "Partial Payment", 
    depositedAmount: 0,
    remainingAmount: 0,
    orderStatus: "Pending",  
    paymentStatus: "Pending", 
    remarks: ""
  });

  // Derived State for Display
  const displayedTotal = (Number(formData.priceAtOrderTime) || 0) * (Number(formData.quantity) || 1);

  // 1. Fetch Products & Agents on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, userRes] = await Promise.all([
           axios.get(api.Product.GetAll, { headers: { Authorization: `Bearer ${authUser?.token}` } }),
           axios.get(api.User.GetAllUsers || api.User.GetAll, { headers: { Authorization: `Bearer ${authUser?.token}` } })
        ]);
        setProducts(productRes.data.data || []);
        setAgents(userRes.data.data || []); 
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load products or agents list.");
      }
    };
    fetchData();
  }, [authUser]);

  // 2. Handle Product Selection (Auto-fill Price)
  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const selectedProduct = products.find(p => p._id === selectedId);
    
    setFormData(prev => ({
      ...prev,
      productId: selectedId,
      priceAtOrderTime: selectedProduct ? selectedProduct.price : prev.priceAtOrderTime
    }));
  };

  // 3. General Input Change (With Auto-Calculation logic)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Recalculate Remaining Amount if relevant fields change
      if (name === "depositedAmount" || name === "priceAtOrderTime" || name === "quantity") {
        const price = Number(updatedData.priceAtOrderTime) || 0;
        const qty = Number(updatedData.quantity) || 1;
        const currentTotal = price * qty;
        
        const deposit = Number(updatedData.depositedAmount) || 0;
        updatedData.remainingAmount = Math.max(0, currentTotal - deposit);
      }

      return updatedData;
    });
  };

  // 4. Validation
  const validateForm = () => {
    const phoneRegex = /^[6-9]\d{9}$/; 
    const pincodeRegex = /^\d{6}$/;

    if (!formData.customerName.trim()) return "Customer Name is required.";
    if (!formData.address.trim()) return "Address is required.";
    if (!pincodeRegex.test(formData.pincode)) return "Pincode must be exactly 6 digits.";
    if (!phoneRegex.test(formData.phone)) return "Phone must be 10 digits & start with 6-9.";
    if (!formData.productId.trim()) return "Please select a Product.";
    if (!formData.agentId.trim()) return "Please select an Agent.";
    if (formData.quantity < 1) return "Quantity must be at least 1.";
    if (!formData.priceAtOrderTime || Number(formData.priceAtOrderTime) < 0) return "Price cannot be negative.";
    
    // CONDITION: Only validate deposit if Payment Mode is Partial
    if (formData.paymentMode === "Partial Payment") {
        if (Number(formData.depositedAmount) < 0) return "Deposited amount cannot be negative.";
        if (Number(formData.depositedAmount) > displayedTotal) return "Deposited amount cannot be greater than Total Amount.";
    }

    return null;
  };

  // 🔥 5. Handle Submit (FIXED FOR 400 ERROR)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const token = authUser?.token;
      
      // 🔥 FIX: Explicitly convert Strings to Numbers
      // Backend Joi Validation requires valid numbers, HTML inputs return strings.
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        priceAtOrderTime: Number(formData.priceAtOrderTime),
        // If mode is Partial, convert input to number. If not, force 0.
        depositedAmount: formData.paymentMode === "Partial Payment" ? Number(formData.depositedAmount) : 0,
        remainingAmount: formData.paymentMode === "Partial Payment" ? Number(formData.remainingAmount) : 0,
      };

      await axios.post(api.Order.Create, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onSuccess) onSuccess(); 
      onClose(); 
    } catch (err) {
      console.error("Create Order Error:", err);
      const serverMsg = err.response?.data?.errors 
        ? (Array.isArray(err.response.data.errors) ? err.response.data.errors.join(", ") : err.response.data.errors)
        : err.response?.data?.message || "Failed to create order.";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const styles = {
    overlay: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(8px)",
      zIndex: 1100,
      display: "flex", justifyContent: "center", alignItems: "center",
      animation: "fadeIn 0.2s ease-out"
    },
    modal: {
      background: "#ffffff",
      width: "95%", maxWidth: "650px",
      borderRadius: "20px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      maxHeight: "90vh",
      fontFamily: '"Inter", sans-serif'
    },
    header: {
      padding: "24px 32px", 
      borderBottom: "1px solid #f1f5f9",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "linear-gradient(to right, #f8fafc, #ffffff)"
    },
    headerTitle: { fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 },
    closeButton: {
      background: "#f1f5f9", border: "none", borderRadius: "50%",
      width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "18px", color: "#64748b", cursor: "pointer"
    },
    body: { padding: "32px", overflowY: "auto" },
    footer: {
      padding: "24px 32px", borderTop: "1px solid #f1f5f9", 
      background: "#fff", display: "flex", justifyContent: "flex-end", gap: "12px"
    },
    sectionTitle: { 
      fontSize: "12px", fontWeight: "700", color: "#94a3b8", 
      marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" 
    },
    inputGroup: { marginBottom: "20px" },
    label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "8px" },
    input: {
      width: "100%", padding: "12px 16px", borderRadius: "8px",
      border: "1px solid #e2e8f0", fontSize: "14px", color: "#0f172a",
      outline: "none", backgroundColor: "#f8fafc"
    },
    readOnlyInput: {
      width: "100%", padding: "12px 16px", borderRadius: "8px",
      border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "700",
      color: "#1e293b", backgroundColor: "#e2e8f0", cursor: "not-allowed"
    },
    gridTwo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    errorBox: {
      marginBottom: "24px", padding: "12px 16px", 
      background: "#fef2f2", border: "1px solid #fee2e2", 
      color: "#991b1b", borderRadius: "8px", fontSize: "14px", fontWeight: "500",
    },
    primaryBtn: {
      padding: "12px 24px", borderRadius: "10px", border: "none", 
      background: loading ? "#94a3b8" : "#2563eb", 
      color: "white", fontWeight: "600", fontSize: "14px", cursor: "pointer"
    },
    secondaryBtn: {
      padding: "12px 24px", borderRadius: "10px", 
      border: "1px solid #e2e8f0", background: "white", 
      color: "#475569", fontWeight: "600", fontSize: "14px", cursor: "pointer"
    },
    partialBox: {
        gridColumn: "1 / -1", 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "20px",
        backgroundColor: "#f0f9ff", 
        padding: "20px", 
        borderRadius: "12px", 
        marginBottom: "20px",
        border: "1px dashed #bae6fd"
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Create New Order</h2>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <form id="create-order-form" onSubmit={handleSubmit}>
            
            {/* 1. Customer Section */}
            <div style={styles.sectionTitle}>Customer Information</div>
            <div style={styles.gridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Name *</label>
                <input style={styles.input} name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Full Name" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input style={styles.input} name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Shipping Address *</label>
              <input style={styles.input} name="address" value={formData.address} onChange={handleChange} placeholder="Full shipping address" />
            </div>

            <div style={styles.gridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Pincode *</label>
                <input style={styles.input} name="pincode" value={formData.pincode} onChange={handleChange} placeholder="560001" maxLength={6} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Order Status</label>
                <select 
                  style={{ ...styles.input, cursor: "pointer" }} 
                  name="orderStatus" 
                  value={formData.orderStatus} 
                  onChange={handleChange}
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ height: "1px", background: "#f1f5f9", margin: "10px 0 24px 0" }}></div>

            {/* 2. Order Details Section */}
            <div style={styles.sectionTitle}>Order Details</div>
            
            <div style={styles.gridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Product *</label>
                <select 
                  style={{ ...styles.input, cursor: "pointer" }} 
                  name="productId" 
                  value={formData.productId} 
                  onChange={handleProductChange}
                >
                  <option value="">-- Select Product --</option>
                  {products.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.name || prod.title || prod.productName || "Unnamed Product"}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity</label>
                <input style={styles.input} type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} />
              </div>
            </div>

            <div style={styles.gridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price (Per Unit) *</label>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "12px", color: "#94a3b8" }}>₹</span>
                    <input 
                      style={{ ...styles.input, paddingLeft: "30px" }} 
                      type="number" 
                      name="priceAtOrderTime" 
                      value={formData.priceAtOrderTime} 
                      onChange={handleChange} 
                    />
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Total Amount (Auto)</label>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "12px", color: "#64748b" }}>₹</span>
                    <input 
                      readOnly
                      style={{ ...styles.readOnlyInput, paddingLeft: "30px" }} 
                      value={displayedTotal.toFixed(2)} 
                    />
                </div>
              </div>
            </div>

            {/* 3. Payment Details */}
            <div style={styles.sectionTitle}>Payment Details</div>
            <div style={styles.gridTwo}>
               <div style={styles.inputGroup}>
                <label style={styles.label}>Payment Mode *</label>
                <select 
                  style={{ ...styles.input, cursor: "pointer" }} 
                  name="paymentMode" 
                  value={formData.paymentMode} 
                  onChange={handleChange}
                >
                  {PAYMENT_MODES.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Payment Status</label>
                <select 
                  style={{ ...styles.input, cursor: "pointer" }} 
                  name="paymentStatus" 
                  value={formData.paymentStatus} 
                  onChange={handleChange}
                >
                   {PAYMENT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* CONDITIONAL RENDERING: ONLY SHOW IF PARTIAL PAYMENT */}
            {formData.paymentMode === "Partial Payment" && (
              <div style={styles.partialBox}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Deposited Amount *</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "12px", color: "#0ea5e9" }}>₹</span>
                    <input 
                      style={{ ...styles.input, paddingLeft: "30px", borderColor: "#bae6fd", background: "#fff" }} 
                      type="number" 
                      name="depositedAmount" 
                      value={formData.depositedAmount} 
                      onChange={handleChange} 
                      placeholder="0"
                    />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Remaining Amount</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "12px", color: "#ef4444" }}>₹</span>
                    <input 
                      readOnly
                      style={{ ...styles.readOnlyInput, paddingLeft: "30px", color: "#ef4444", background: "#fee2e2" }} 
                      value={formData.remainingAmount} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Logistics Section */}
            <div style={styles.sectionTitle}>Logistics</div>
            <div style={styles.gridTwo}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Select Agent *</label>
                    <select 
                        style={{ ...styles.input, cursor: "pointer" }} 
                        name="agentId" 
                        value={formData.agentId} 
                        onChange={handleChange}
                    >
                        <option value="">-- Select Agent --</option>
                        {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                            {agent.name || agent.username || agent.email}
                        </option>
                        ))}
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>AWB Number</label>
                    <input 
                        style={styles.input} 
                        name="awb" 
                        value={formData.awb} 
                        onChange={handleChange} 
                        placeholder="e.g. AWB123456" 
                    />
                </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Remarks (Optional)</label>
              <textarea style={{ ...styles.input, height: "80px", resize: "none" }} name="remarks" value={formData.remarks} onChange={handleChange} placeholder="e.g. Deliver between 10 AM - 5 PM" />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button type="button" onClick={onClose} style={styles.secondaryBtn}>Cancel</button>
          <button type="submit" form="create-order-form" disabled={loading} style={styles.primaryBtn}>
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewOrder;