import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../../api/api"; 
import { useAuthStore } from "../../../../store/authStore"; 

// --- COMPACT & PROFESSIONAL INVOICE TEMPLATE (FIXED) ---
const getInvoiceTemplate = (order) => {
  const date = new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const invoiceNo = (order._id || order.id || "0000").slice(-6).toUpperCase();
  const productName = order.productId?.productName || "Product Name Unavailable";
  
  // --- CALCULATION LOGIC ---
  const total = Number(order.totalAmount) || 0;
  const isPartial = order.paymentMode === 'Partial Payment';
  const deposit = Number(order.depositedAmount) || 0;

  // Determine Final Row Values
  let finalLabel = "TOTAL";
  let finalAmount = total;

  if (isPartial) {
    finalLabel = "TOTAL DUE";
    finalAmount = total - deposit; // The bottom line is now the Balance
  }

  // Premium Theme Colors
  const theme = {
    primary: "#0f172a",   // Navy
    accent: "#f59e0b",    // Gold
    border: "#e2e8f0",    // Light Gray
    text: "#334155",      // Dark Gray
    textLight: "#64748b", // Medium Gray
    bgLight: "#f8fafc"    // Very Light Gray
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${invoiceNo}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page { margin: 0; size: A4; }
          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0; padding: 0; 
            color: ${theme.text};
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            display: flex;
            flex-direction: column;
          }

          /* --- HEADER --- */
          .header {
            background-color: ${theme.primary};
            color: white;
            padding: 30px 40px; 
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
            height: 80px; 
          }
          
          .header::after {
            content: ""; position: absolute; right: -30px; bottom: -50px;
            width: 120px; height: 120px; border-radius: 50%;
            border: 15px solid rgba(255,255,255,0.05);
          }

          .brand h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
          .brand p { margin: 2px 0 0; font-size: 11px; opacity: 0.8; }
          
          .invoice-title { text-align: right; z-index: 2; }
          .invoice-title h2 { margin: 0; font-size: 32px; font-weight: 700; color: ${theme.accent}; letter-spacing: -1px; line-height: 1; }
          .invoice-title span { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9; }

          /* --- INFO SECTION --- */
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 30px 40px 10px 40px; 
            gap: 20px;
          }

          .bill-to h3 { font-size: 10px; text-transform: uppercase; color: ${theme.textLight}; letter-spacing: 1px; margin-bottom: 5px; font-weight: 600; }
          .client-name { font-size: 16px; font-weight: 700; color: ${theme.primary}; margin-bottom: 4px; }
          .client-address { font-size: 12px; line-height: 1.4; color: ${theme.text}; max-width: 300px; }
          
          .meta-group { text-align: right; display: flex; flex-direction: column; gap: 8px; }
          .meta-row { display: flex; align-items: center; justify-content: flex-end; gap: 15px; }
          .meta-label { font-size: 11px; color: ${theme.textLight}; font-weight: 600; text-transform: uppercase; }
          .meta-val { font-size: 13px; font-weight: 700; color: ${theme.primary}; }
          
          .status-pill {
            background: ${order.paymentStatus === 'Paid' ? '#dcfce7' : '#fee2e2'};
            color: ${order.paymentStatus === 'Paid' ? '#15803d' : '#b91c1c'};
            padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700;
            text-transform: uppercase; display: inline-block;
          }

          /* --- TABLE --- */
          .table-container { padding: 20px 40px; flex-grow: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          
          th { 
            text-align: left; padding: 10px 8px; 
            font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; 
            color: ${theme.textLight}; border-bottom: 2px solid ${theme.border}; 
          }
          
          td { 
            padding: 12px 8px; 
            border-bottom: 1px solid ${theme.border}; 
            font-size: 12px; color: ${theme.primary}; vertical-align: middle;
          }
          
          .col-desc { width: 55%; }
          .col-right { text-align: right; }
          
          .item-name { font-weight: 600; display: block; margin-bottom: 2px; font-size: 13px; }
          .item-meta { font-size: 10px; color: ${theme.textLight}; }

          /* --- TOTALS --- */
          .footer-wrap { padding: 0 40px 30px 40px; page-break-inside: avoid; }
          
          .totals-section { 
            display: flex; justify-content: flex-end; 
            margin-top: 10px; 
          }
          .totals-table { width: 240px; }
          
          .t-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: ${theme.text}; }
          .t-row.grand { 
            border-top: 2px solid ${theme.primary}; margin-top: 8px; padding-top: 10px; 
            font-weight: 700; font-size: 15px; color: ${theme.primary}; 
          }

          /* --- BOTTOM BAR --- */
          .bottom-info { 
            margin-top: 30px; border-top: 1px dashed ${theme.border}; padding-top: 20px; 
            display: flex; justify-content: space-between; align-items: flex-end; 
          }
          .notes h4 { font-size: 11px; margin: 0 0 5px 0; color: ${theme.primary}; text-transform: uppercase; }
          .notes p { margin: 0; font-size: 10px; color: ${theme.textLight}; line-height: 1.4; max-width: 350px; }
          
          .signature { text-align: center; }
          .sig-line { width: 140px; border-bottom: 1px solid ${theme.border}; margin-bottom: 5px; }
          .sig-text { font-size: 9px; font-weight: 600; color: ${theme.textLight}; text-transform: uppercase; letter-spacing: 1px; }

          @media print { .page { box-shadow: none; margin: 0; width: 100%; height: 100%; } }
        </style>
      </head>
      <body>
        <div class="page">
          
          <div class="header">
            <div class="brand">
              <h1>COMPANY NAME</h1>
              <p>Tagline or Registration ID</p>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <span>#${invoiceNo}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="bill-to">
              <h3>Billed To</h3>
              <div class="client-name">${order.customerName}</div>
              <div class="client-address">
                ${order.phone || ""}
                ${order.address ? `<br>${order.address}` : ""}
                ${order.pincode ? `, ${order.pincode}` : ""}
              </div>
            </div>
            <div class="meta-group">
              <div class="meta-row">
                <span class="meta-label">Date</span>
                <span class="meta-val">${date}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Status</span>
                <span class="status-pill">${order.paymentStatus}</span>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th class="col-desc">Description</th>
                  <th class="col-right">Price</th>
                  <th class="col-right">Qty</th>
                  <th class="col-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="col-desc">
                    <span class="item-name">${productName}</span>
                    <span class="item-meta">AWB: ${order.awb || "N/A"} &bull; Mode: ${order.paymentMode}</span>
                  </td>
                  <td class="col-right">₹${Number(order.priceAtOrderTime).toLocaleString()}</td>
                  <td class="col-right">${order.quantity}</td>
                  <td class="col-right" style="font-weight:600">₹${total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer-wrap">
            <div class="totals-section">
              <div class="totals-table">
                <div class="t-row"><span>Subtotal</span> <span>₹${total.toLocaleString()}</span></div>
                <div class="t-row"><span>Tax (0%)</span> <span>₹0.00</span></div>
                <div class="t-row"><span>Shipping</span> <span>₹0.00</span></div>
                
                ${isPartial ? `
                <div class="t-row" style="color:#15803d; margin-top:4px;">
                   <span>Paid Deposit</span> <span>- ₹${deposit.toLocaleString()}</span>
                </div>
                ` : ''}

                <div class="t-row grand"><span>${finalLabel}</span> <span>₹${finalAmount.toLocaleString()}</span></div>
              </div>
            </div>

            <div class="bottom-info">
              <div class="notes">
                <h4>Payment & Notes</h4>
                <p>Payment is due upon receipt. Please include the invoice number in your transfer description. Thank you for your business!</p>
              </div>
              <div class="signature">
                <div class="sig-line"></div>
                <div class="sig-text">Authorized Signature</div>
              </div>
            </div>
          </div>

        </div>
      </body>
    </html>
  `;
};

// --- MODAL COMPONENT ---
const OrderDetailsModal = ({ order, onClose, onOrderUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableOrder, setEditableOrder] = useState(null);
  const { user: authUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // --- ADMIN CHECK ---
  const isAdmin = authUser?.role === 'admin'; 

  useEffect(() => {
    if (order) setEditableOrder(order);
  }, [order]);

  if (!editableOrder) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableOrder((prev) => {
      let newState = { ...prev, [name]: value };
      const getNum = (val) => parseFloat(val) || 0;
      
      const qty = name === "quantity" ? getNum(value) : getNum(prev.quantity);
      const price = name === "priceAtOrderTime" ? getNum(value) : getNum(prev.priceAtOrderTime);
      newState.totalAmount = qty * price;

      if (name === "paymentMode") {
        if (value === "Full Payment") newState.depositedAmount = newState.totalAmount;
        else if (value === "COD") newState.depositedAmount = 0;
      }

      const currentDeposit = name === "depositedAmount" ? getNum(value) : getNum(newState.depositedAmount);
      if (newState.paymentMode === "Partial Payment") {
         newState.remainingAmount = Math.max(0, newState.totalAmount - currentDeposit);
      } else if (newState.paymentMode === "Full Payment") {
         newState.remainingAmount = 0;
         newState.depositedAmount = newState.totalAmount;
      } else {
         newState.remainingAmount = newState.totalAmount;
      }
      return newState;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = authUser?.token;
      const payload = {
        id: editableOrder._id || editableOrder.id, 
        customerName: editableOrder.customerName,
        address: editableOrder.address,
        pincode: editableOrder.pincode,
        phone: editableOrder.phone,
        quantity: Number(editableOrder.quantity),
        priceAtOrderTime: Number(editableOrder.priceAtOrderTime),
        awb: editableOrder.awb,
        orderStatus: editableOrder.orderStatus,
        paymentStatus: editableOrder.paymentStatus,
        paymentMode: editableOrder.paymentMode,
        depositedAmount: Number(editableOrder.depositedAmount),
        remainingAmount: Number(editableOrder.remainingAmount),
        remarks: editableOrder.remarks
      };
      await axios.put(api.Order.Update, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Order updated successfully!");
      setIsEditing(false);
      if (onOrderUpdated) onOrderUpdated();
      if(onClose) onClose(); 
    } catch (error) {
      console.error(error);
      alert("Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Please allow popups to view the invoice.");
    const invoiceHTML = getInvoiceTemplate(editableOrder);
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const getProductName = () => editableOrder.productId?.productName || "Product Name Unavailable";

  const styles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)", zIndex: 1200, display: "flex", justifyContent: "center", alignItems: "center" },
    modal: { background: "#fff", borderRadius: "16px", width: "95%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden", fontFamily: '"Inter", sans-serif' },
    header: { padding: "16px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" },
    body: { padding: "24px", overflowY: "auto", background: "#f8fafc", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px" },
    card: { background: "#ffffff", borderRadius: "8px", padding: "20px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" },
    fieldRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", minHeight: "32px" },
    label: { color: "#64748b", fontWeight: "500" },
    value: { color: "#1e293b", fontWeight: "600", textAlign: "right" },
    input: { padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", width: "100%", outline:"none" },
    select: { padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "13px", width: "100%", background:"white" },
    badge: (status) => ({ background: status === 'Paid' ? "#dcfce7" : "#f1f5f9", color: status === 'Paid' ? "#15803d" : "#475569", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }),
    footer: { padding: "16px 24px", background: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "12px" },
    btn: (primary) => ({ padding: "8px 20px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: primary ? "none" : "1px solid #cbd5e1", background: primary ? "#0f172a" : "#fff", color: primary ? "#fff" : "#475569" }),
    invoiceBtn: { background: "#eff6ff", color: "#2563eb", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }
  };

  const InfoRow = ({ label, value, name, type = "text", readOnly = false, restrictedToAdmin = false }) => {
    const canEdit = isEditing && (!restrictedToAdmin || isAdmin) && !readOnly;
    return (
      <div style={styles.fieldRow}>
        <span style={styles.label}>{label}</span>
        {canEdit ? (
          <div style={{ width: "60%" }}><input style={styles.input} name={name} value={value ?? ""} onChange={handleInputChange} type={type} /></div>
        ) : (
          <span style={styles.value}>{value || "-"}</span>
        )}
      </div>
    );
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
           <div><span style={{fontSize:"11px", color:"#64748b", fontWeight:"700", letterSpacing:"0.5px"}}>ORDER ID: {editableOrder._id.slice(-6).toUpperCase()}</span><h2 style={{fontSize:"20px", fontWeight:"700", color:"#0f172a", margin:"2px 0 0 0"}}>Order Details</h2></div>
           <div style={{ display: "flex", gap: "12px" }}>
              <button style={styles.invoiceBtn} onClick={handleDownloadInvoice}><span>📄</span> Print Invoice</button>
              <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "24px", color: "#94a3b8", cursor: "pointer" }}>&times;</button>
           </div>
        </div>
        <div style={styles.body}>
           <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={styles.card}>
                 <div style={{fontSize:"12px", fontWeight:"700", color:"#334155", paddingBottom:"10px", borderBottom:"1px dashed #cbd5e1", textTransform:"uppercase"}}>👤 Customer</div>
                 <InfoRow label="Name" name="customerName" value={editableOrder.customerName} restrictedToAdmin={true} />
                 <InfoRow label="Phone" name="phone" value={editableOrder.phone} restrictedToAdmin={true} />
                 <InfoRow label="Pincode" name="pincode" value={editableOrder.pincode} restrictedToAdmin={true} />
                 <div>
                    <span style={{...styles.label, display:"block", marginBottom:"4px"}}>Address</span>
                    {isEditing && isAdmin ? 
                        <textarea style={{...styles.input, height:"60px", resize:"none"}} name="address" value={editableOrder.address || ""} onChange={handleInputChange}/> 
                        : <div style={{...styles.value, textAlign:"left", fontSize:"12px", lineHeight:"1.4"}}>{editableOrder.address}</div>
                    }
                 </div>
              </div>
              <div style={styles.card}>
                 <div style={{fontSize:"12px", fontWeight:"700", color:"#334155", paddingBottom:"10px", borderBottom:"1px dashed #cbd5e1", textTransform:"uppercase"}}>🚚 Logistics</div>
                 <div style={styles.fieldRow}>
                    <span style={styles.label}>Status</span>
                    {isEditing ? (
                        <div style={{width:"60%"}}><select style={styles.select} name="orderStatus" value={editableOrder.orderStatus} onChange={handleInputChange}><option>Pending</option><option>Confirmed</option><option>Packed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></div> 
                    ) : (
                        <span style={styles.badge(editableOrder.orderStatus)}>{editableOrder.orderStatus}</span>
                    )}
                 </div>
                 <InfoRow label="AWB" name="awb" value={editableOrder.awb} restrictedToAdmin={false} />
                 <InfoRow label="Agent" name="agentName" value={editableOrder.agentId?.name || "Unassigned"} readOnly={true} />
              </div>
           </div>
           <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={styles.card}>
                 <div style={{fontSize:"12px", fontWeight:"700", color:"#334155", paddingBottom:"10px", borderBottom:"1px dashed #cbd5e1", textTransform:"uppercase"}}>📦 Product</div>
                 <div style={styles.fieldRow}><span style={styles.label}>Product</span><span style={{...styles.value, color:"#0f172a"}}>{getProductName()}</span></div>
                 <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px", marginTop:"5px"}}>
                    <InfoRow label="Qty" name="quantity" value={editableOrder.quantity} type="number" restrictedToAdmin={true} />
                    <InfoRow label="Price" name="priceAtOrderTime" value={editableOrder.priceAtOrderTime} type="number" restrictedToAdmin={true} />
                 </div>
              </div>
              <div style={styles.card}>
                 <div style={{fontSize:"12px", fontWeight:"700", color:"#334155", paddingBottom:"10px", borderBottom:"1px dashed #cbd5e1", textTransform:"uppercase"}}>💳 Payment</div>
                 <div style={{...styles.fieldRow, background:"#f1f5f9", padding:"8px", borderRadius:"6px", border:"1px solid #e2e8f0"}}><span style={{fontWeight:"600", color:"#64748b"}}>Total Amount</span><span style={{fontWeight:"800", color:"#0f172a", fontSize:"15px"}}>₹{editableOrder.totalAmount?.toLocaleString()}</span></div>
                 
                 <div style={styles.fieldRow}>
                    <span style={styles.label}>Mode</span>
                    {isEditing ? <div style={{width:"60%"}}><select style={styles.select} name="paymentMode" value={editableOrder.paymentMode} onChange={handleInputChange}><option value="COD">COD</option><option value="Full Payment">Full Payment</option><option value="Partial Payment">Partial Payment</option></select></div> : <span style={{fontWeight:"600", fontSize:"13px"}}>{editableOrder.paymentMode}</span>}
                 </div>
                 <div style={styles.fieldRow}>
                    <span style={styles.label}>Status</span>
                    {isEditing ? <div style={{width:"60%"}}><select style={styles.select} name="paymentStatus" value={editableOrder.paymentStatus} onChange={handleInputChange}><option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Failed">Failed</option></select></div> : <span style={styles.badge(editableOrder.paymentStatus)}>{editableOrder.paymentStatus}</span>}
                 </div>
                 
                 {editableOrder.paymentMode === "Partial Payment" && <div style={{marginTop:"8px", background:"#f0f9ff", padding:"12px", borderRadius:"6px", border:"1px dashed #bae6fd"}}>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:"8px"}}>
                        <span style={{fontSize:"12px", color:"#0369a1", fontWeight:"600"}}>Deposited</span>
                        {isEditing ? <input style={{...styles.input, width:"80px", textAlign:"right"}} type="number" name="depositedAmount" value={editableOrder.depositedAmount} onChange={handleInputChange}/> : <span style={{color:"#0284c7", fontWeight:"700"}}>₹{editableOrder.depositedAmount}</span>}
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between"}}>
                        <span style={{fontSize:"12px", color:"#b91c1c", fontWeight:"600"}}>Remaining</span>
                        <span style={{color:"#dc2626", fontWeight:"700"}}>₹{editableOrder.remainingAmount}</span>
                    </div>
                 </div>}
              </div>
           </div>
        </div>
        <div style={styles.footer}>
           {isEditing ? <><button style={styles.btn(false)} onClick={() => { setIsEditing(false); setEditableOrder(order); }}>Cancel</button><button style={styles.btn(true)} onClick={handleSave}>{loading ? "Saving..." : "Save"}</button></> : <><button style={styles.btn(false)} onClick={onClose}>Close</button><button style={styles.btn(true)} onClick={() => setIsEditing(true)}>Edit</button></>}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;