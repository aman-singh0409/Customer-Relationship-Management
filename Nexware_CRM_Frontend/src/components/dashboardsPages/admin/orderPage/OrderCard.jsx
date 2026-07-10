import React from "react";
import {
  User,
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  MapPin,
} from "lucide-react";

const ORDER_STATUSES = [
  "Pending", "Confirmed", "Packed", "Shipped", "In Transit",
  "Out For Delivery", "Delivered", "RTO Initiated", "RTO Received",
  "Returned", "Cancelled",
];

const getTheme = (status = "Pending") => {
  switch (status) {
    case "Delivered":
      return { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    case "Cancelled":
    case "Returned":
    case "RTO Initiated":
    case "RTO Received":
      return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    case "Shipped":
    case "In Transit":
    case "Out For Delivery":
      return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    case "Confirmed":
    case "Packed":
      return { text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" };
    default:
      return { text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
  }
};

const OrderCard = ({ order, onClick }) => {
  // Handle data keys from your backend (orderStatus vs status)
  const rawStatus = order?.orderStatus || order?.status || "Pending";
  const status = ORDER_STATUSES.includes(rawStatus) ? rawStatus : "Pending";
  const theme = getTheme(status);

  // Handle Product Name extraction (nested or flat)
  const productName = order?.productId?.name || order?.productName || "Product";

  return (
    <div
      onClick={() => onClick(order)} // Pass the specific order object back
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${theme.border}`}
    >
      {/* Top Colored Strip */}
      <div className={`absolute top-0 left-0 h-1.5 w-full rounded-t-2xl ${theme.bg.replace("50", "500")}`} />

      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm">
          <User size={18} />
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text}`}>
          {status}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 px-5">
        <h3 className="mt-2 text-lg font-bold text-slate-900 line-clamp-1">
          {order?.customerName || "Unknown Customer"}
        </h3>

        <div className="mb-5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <MapPin size={12} />
          <span className="line-clamp-1">{order?.address || "No Address"}</span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-dashed border-slate-200 pt-4 pb-2">
          
          {/* Product */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Product</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Package size={14} className="text-slate-400" />
              <span className="truncate">{productName}</span>
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Amount</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              ₹ {order?.totalAmount?.toLocaleString() ?? 0}
            </p>
          </div>

          {/* Date */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Date</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Calendar size={14} className="text-slate-400" />
              {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Payment</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <CreditCard size={14} className="text-slate-400" />
              <span className={order?.paymentMode === "Partial Payment" ? "text-orange-600 font-semibold" : ""}>
                 {order?.paymentStatus || "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs font-semibold text-slate-500 rounded-b-2xl">
        <span className="font-mono">#{order?._id?.slice(-6).toUpperCase() || "----"}</span>
        <span className={`flex items-center gap-1 transition-transform group-hover:translate-x-1 ${theme.text}`}>
          View Details <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
};

export default OrderCard;