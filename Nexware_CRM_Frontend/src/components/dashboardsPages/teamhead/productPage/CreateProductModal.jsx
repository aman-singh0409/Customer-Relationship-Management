import React, { useState, useEffect } from "react";
import { 
  X, 
  UploadCloud, 
  DollarSign, 
  Package, 
  Layers, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CreateProductModal = ({ isOpen, onClose, onSubmit }) => {
  // Initial State
  const initialState = {
    productName: "",
    description: "",
    price: "",
    offerPrice: "",
    category: "",
    stock: 0,
    status: "active",
    images: [] // This will store File objects
  };

  const [formData, setFormData] = useState(initialState);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
      setImagePreviews([]);
      setErrors({});
    }
  }, [isOpen]);

  // Handle Text Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };

  // Remove Image
  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  // Validation & Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Mongoose Validator Check: Offer Price <= Price
    if (formData.offerPrice && Number(formData.offerPrice) > Number(formData.price)) {
      newErrors.offerPrice = "Offer price cannot be greater than regular price.";
    }

    if (!formData.productName) newErrors.productName = "Product name is required.";
    if (!formData.price) newErrors.price = "Price is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit(formData); // Pass data back to parent
    setIsSubmitting(false);
    onClose();
  };

  // Auto-generate slug for display only
  const generatedSlug = formData.productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Animation Variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5 } },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Add New Product</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fill in the details to create a new inventory item.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Basic Info & Pricing */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Section: General */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-indigo-500" /> Basic Information
                  </h3>
                  
                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Product Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      placeholder="e.g. Wireless Noise Cancelling Headphones"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.productName ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} focus:ring-4 focus:outline-none transition-all text-sm`}
                    />
                    {formData.productName && (
                      <p className="text-[10px] text-slate-400 font-mono">Slug: /{generatedSlug}</p>
                    )}
                  </div>

                  {/* Category & Status Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Category <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g. Electronics"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none transition-all text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="outofstock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Description <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FileText className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe the product features, specs, etc..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Pricing & Stock */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Pricing & Inventory
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Price */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Regular Price <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          name="price"
                          min="0"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          className={`w-full pl-7 pr-4 py-2.5 rounded-lg border ${errors.price ? 'border-red-300' : 'border-slate-200'} focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all text-sm`}
                        />
                      </div>
                    </div>

                    {/* Offer Price */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Offer Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                        <input
                          type="number"
                          name="offerPrice"
                          min="0"
                          value={formData.offerPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          className={`w-full pl-7 pr-4 py-2.5 rounded-lg border ${errors.offerPrice ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all text-sm`}
                        />
                      </div>
                      {errors.offerPrice && (
                        <p className="text-[10px] text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.offerPrice}
                        </p>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Stock Quantity</label>
                      <div className="relative">
                        <Package className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          name="stock"
                          min="0"
                          value={formData.stock}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 focus:outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Images */}
              <div className="lg:col-span-1">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <ImageIcon className="w-4 h-4 text-blue-500" /> Product Images
                  </h3>
                  
                  {/* Upload Zone */}
                  <div className="relative group w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold">Click to upload or drag & drop</span>
                    </div>
                  </div>

                  {/* Previews Grid */}
                  {imagePreviews.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 flex-1 flex flex-col items-center justify-center text-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                      <div className="w-16 h-16 bg-slate-200/50 rounded-full flex items-center justify-center mb-2">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400">No images selected yet.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Default image will be used if none provided.</p>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Create Product
                </>
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateProductModal;