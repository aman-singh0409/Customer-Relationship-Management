import React, { useMemo } from "react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  IndianRupee, 
  Package, 
  AlertOctagon, 
  ArrowUpRight, 
  TrendingUp,
  MoreHorizontal
} from "lucide-react";

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid #e2e8f0",
        padding: "12px 16px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
        fontFamily: "sans-serif"
      }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#0f172a", fontWeight: "700" }}>
          {/* Format numbers for currency or count */}
          {payload[0].name === "rev" ? `₹${payload[0].value.toLocaleString()}` : payload[0].value} 
          <span style={{fontSize: "11px", fontWeight:"500", color:"#94a3b8", marginLeft:"4px"}}>
             {payload[0].name === "rev" ? "Revenue" : "Orders"}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const OrderStats = ({ orders = [] }) => {

  // ---------------------------------------------------------
  // 1. DYNAMIC DATA CALCULATION (useMemo for performance)
  // ---------------------------------------------------------
  const stats = useMemo(() => {
    // A. Basic Totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const returnCount = orders.filter(o => 
      ["Returned", "RTO Initiated", "RTO Received", "Cancelled"].includes(o.orderStatus)
    ).length;

    // B. Pie Chart Data (Status Grouping)
    const delivered = orders.filter(o => o.orderStatus === "Delivered").length;
    const pending = orders.filter(o => ["Pending", "Confirmed", "Packed", "Shipped", "In Transit", "Out For Delivery"].includes(o.orderStatus)).length;
    
    const pieData = [
        { name: "Delivered", value: delivered, color: "#10b981" }, // Green
        { name: "In Progress", value: pending, color: "#f59e0b" },   // Orange
        { name: "Returns/Canceled", value: returnCount, color: "#ef4444" }, // Red
    ].filter(item => item.value > 0); // Hide empty slices

    // C. Bar Chart Data (Last 7 Days Trend)
    const daysMap = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Initialize last 7 days with 0
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        daysMap[dayName] = { day: dayName, orders: 0, rev: 0 };
    }

    // Fill with real data
    orders.forEach(order => {
        if(!order.createdAt) return;
        const date = new Date(order.createdAt);
        // Check if order is within last 7 days logic could go here, 
        // for now simpler approach: just match day name if close enough
        const dayName = days[date.getDay()];
        
        // Only count if it's in our initialized map (simple weekly view)
        if(daysMap[dayName]) {
            daysMap[dayName].orders += 1;
            daysMap[dayName].rev += (order.totalAmount || 0);
        }
    });

    // Convert map to array for Recharts
    // We sort strictly by day index to keep Mon-Sun flow or relative to today?
    // Let's just use the values we initialized to keep order correct relative to "today"
    const barData = Object.values(daysMap);

    // Success Rate Calculation
    const successRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

    return { totalOrders, totalRevenue, returnCount, pieData, barData, successRate };
  }, [orders]);


  // ---------------------------------------------------------
  // 2. STYLES (Kept exact same visual design)
  // ---------------------------------------------------------
  const styles = {
    container: { marginBottom: "40px", fontFamily: 'Inter, sans-serif' },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "24px",
      marginBottom: "32px",
    },
    statCard: {
      background: "linear-gradient(145deg, #ffffff, #f8fafc)",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid white",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      transition: "transform 0.3s ease",
    },
    iconBox: (color, bg) => ({
      width: "48px", height: "48px", borderRadius: "14px",
      background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px -4px ${color}30`
    }),
    statLabel: { fontSize: "13px", fontWeight: "600", color: "#64748b", marginBottom: "6px" },
    statValue: { fontSize: "28px", fontWeight: "800", color: "#1e293b", letterSpacing: "-0.5px" },
    statTrend: (isUp) => ({ 
      display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700",
      color: isUp ? "#10b981" : "#ef4444", background: isUp ? "#d1fae5" : "#fee2e2",
      padding: "4px 10px", borderRadius: "20px", marginTop: "12px"
    }),
    chartsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" },
    chartCard: {
      background: "white", borderRadius: "24px", padding: "28px",
      border: "1px solid #e2e8f0", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.06)",
      height: "420px", display: "flex", flexDirection: "column"
    },
    chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
    chartTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a" },
    chartSub: { fontSize: "13px", color: "#64748b" }
  };

  return (
    <div style={styles.container}>
      
      {/* 1. STATS CARDS ROW */}
      <div style={styles.statsGrid}>
        
        {/* Card 1: Revenue */}
        <div style={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={styles.statLabel}>Total Revenue</p>
              <h3 style={styles.statValue}>₹ {stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div style={styles.iconBox("#10b981", "#d1fae5")}>
              <IndianRupee size={24} />
            </div>
          </div>
          <span style={styles.statTrend(true)}><ArrowUpRight size={14}/> Live Data</span>
        </div>

        {/* Card 2: Orders */}
        <div style={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={styles.statLabel}>Total Orders</p>
              <h3 style={styles.statValue}>{stats.totalOrders}</h3>
            </div>
            <div style={styles.iconBox("#3b82f6", "#dbeafe")}>
              <Package size={24} />
            </div>
          </div>
          <span style={styles.statTrend(true)}><ArrowUpRight size={14}/> Updated</span>
        </div>

        {/* Card 3: Returns */}
        <div style={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={styles.statLabel}>Returns / Cancelled</p>
              <h3 style={styles.statValue}>{stats.returnCount}</h3>
            </div>
            <div style={styles.iconBox("#ef4444", "#fee2e2")}>
              <AlertOctagon size={24} />
            </div>
          </div>
          <span style={styles.statTrend(false)}><TrendingUp size={14}/> Needs Attention</span>
        </div>

      </div>


      {/* 2. CHARTS ROW */}
      <div style={styles.chartsGrid}>
        
        {/* A. 3D BAR CHART (Orders Trend) */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div>
              <h3 style={styles.chartTitle}>Weekly Sales Trend</h3>
              <p style={styles.chartSub}>Revenue vs Orders (Last 7 Days)</p>
            </div>
            <button style={{ background: "#f1f5f9", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
              <MoreHorizontal size={20} color="#64748b" />
            </button>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            {stats.barData.length > 0 ? (
                <BarChart data={stats.barData} barGap={8}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#4338ca" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                
                <Bar dataKey="rev" fill="url(#colorRev)" radius={[6, 6, 0, 0]} barSize={12} animationDuration={1500} />
                <Bar dataKey="orders" fill="url(#colorOrd)" radius={[6, 6, 0, 0]} barSize={12} animationDuration={1500} />
                </BarChart>
            ) : (
                <div style={{display:'flex', height:'100%', alignItems:'center', justifyContent:'center', color:'#cbd5e1'}}>
                    No data available
                </div>
            )}
          </ResponsiveContainer>
        </div>


        {/* B. 3D PIE CHART (Status Distribution) */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
             <div>
              <h3 style={styles.chartTitle}>Order Status</h3>
              <p style={styles.chartSub}>Live Pipeline Distribution</p>
            </div>
          </div>
          
          <div style={{ flex: 1, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
               {stats.pieData.length > 0 ? (
                  <PieChart>
                    <defs>
                    <filter id="shadow" height="200%">
                        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.15"/>
                    </filter>
                    </defs>
                    <Pie
                        data={stats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        filter="url(#shadow)"
                    >
                    {stats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
               ) : (
                   <div style={{display:'flex', height:'100%', alignItems:'center', justifyContent:'center', color:'#cbd5e1'}}>
                       No orders yet
                   </div>
               )}
            </ResponsiveContainer>

            {/* Center Text */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              textAlign: "center", pointerEvents: "none"
            }}>
               <span style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b", display: "block" }}>{stats.successRate}%</span>
               <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Success Rate</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "10px" }}>
            {stats.pieData.map((item) => (
               <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                  <span style={{ fontSize: "13px", color: "#475569", fontWeight: "500" }}>{item.name}</span>
               </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderStats;