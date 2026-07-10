import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Tag,
  Package,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  User,
  Box,
  Share2,
  ZoomIn,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetailsModal = ({ product, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    if (product) setSelectedImageIndex(0);
  }, [product]);

  if (!product) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(product._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe access to image URL with a modern placeholder
  const currentImage = product.images?.[selectedImageIndex]?.url || product.images?.[0]?.url || 'https://via.placeholder.com/600x600?text=No+Image';

  // Animation Config
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 350, damping: 25 } 
    },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        
        {/* Darkened Backdrop with Blur */}
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all"
        />

        {/* Modal Card */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ring-1 ring-slate-900/5"
        >
          
          {/* --- Header --- */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-slate-800 leading-tight">Product Details</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {product.category || 'Uncategorized'}
                  </span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${product.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {product.status === 'active' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="hidden sm:flex p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* --- Scrollable Content --- */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
              
              {/* Left: Visual Gallery (5 Columns) */}
              <div className="lg:col-span-5 bg-white p-6 lg:p-8 flex flex-col gap-6 border-r border-slate-100">
                
                {/* Main Image Area */}
                <div 
                  className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group cursor-zoom-in"
                  onMouseEnter={() => setIsHoveringImage(true)}
                  onMouseLeave={() => setIsHoveringImage(false)}
                >
                  <motion.img
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    src={currentImage}
                    alt={product.productName}
                    className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out"
                    style={{ transform: isHoveringImage ? 'scale(1.1)' : 'scale(1)' }}
                  />
                  
                  {/* Floating Zoom Icon */}
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur shadow-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn className="w-4 h-4 text-slate-600" />
                  </div>

                  {/* Stock Status Badge */}
                  <div className="absolute top-4 left-4">
                     {product.stock <= 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                     ) : product.stock < 10 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                     ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 backdrop-blur-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                        </span>
                     )}
                  </div>
                </div>

                {/* Thumbnails Grid */}
                {product.images?.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === idx 
                            ? "border-indigo-600 ring-2 ring-indigo-50 ring-offset-1 scale-105 shadow-md" 
                            : "border-transparent bg-slate-100 hover:border-slate-300 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Details (7 Columns) */}
              <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col gap-8">
                
                {/* Title Section */}
                <div>
                   <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
                    {product.productName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Product
                    </span>
                    <span className="text-sm text-slate-400">
                      Added on {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price Card */}
                  <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-indigo-200 transition-colors">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <CreditCard className="w-16 h-16 transform rotate-12" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price</p>
                    <div className="flex items-baseline gap-2 relative z-10">
                      <span className="text-3xl font-bold text-slate-900">₹{product.offerPrice || product.price}</span>
                      {product.offerPrice && product.offerPrice < product.price && (
                        <span className="text-sm font-medium text-slate-400 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                    {product.offerPrice && (
                       <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                         <Tag className="w-3 h-3" />
                         {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% DISCOUNT
                       </div>
                    )}
                  </div>

                  {/* Inventory Card */}
                  <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-indigo-200 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Status</p>
                        <Box className={`w-4 h-4 ${product.stock < 10 ? 'text-amber-500' : 'text-emerald-500'}`} />
                     </div>
                     <div>
                        <div className="flex items-end justify-between mb-2">
                          <span className="text-2xl font-bold text-slate-900">{product.stock}</span>
                          <span className="text-xs text-slate-500 font-medium">units remaining</span>
                        </div>
                        {/* Modern Progress Bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(product.stock, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${product.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    Description
                  </h3>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {product.description || <span className="text-slate-400 italic">No detailed description provided for this item.</span>}
                  </div>
                </div>

                {/* Metadata Table */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">System Metadata</h3>
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-sm">
                    
                    {/* ID Row */}
                    <div className="group flex items-center justify-between p-3 sm:px-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="p-1.5 bg-slate-100 rounded-md">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">Product ID</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="font-mono text-slate-600 text-xs">{product._id}</span>
                         <button 
                            onClick={handleCopyId}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all relative"
                            title="Copy ID"
                          >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                      </div>
                    </div>

                    {/* Creator Row */}
                    <div className="flex items-center justify-between p-3 sm:px-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 text-slate-500">
                        <div className="p-1.5 bg-slate-100 rounded-md">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">Created By</span>
                      </div>
                      <span className="text-slate-700 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {product.createdBy?.name || "System Admin"}
                      </span>
                    </div>

                    {/* Date Row */}
                    <div className="flex items-center justify-between p-3 sm:px-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 text-slate-500">
                         <div className="p-1.5 bg-slate-100 rounded-md">
                           <Calendar className="w-3.5 h-3.5" />
                         </div>
                         <span className="font-medium">Creation Date</span>
                      </div>
                      <span className="text-slate-700">
                        {product.createdAt ? new Date(product.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : 'Unknown'}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
          
          {/* --- Footer Actions --- */}
          <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 z-10">
             <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;