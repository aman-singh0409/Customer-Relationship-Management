import React, { useState, useEffect } from "react";
import { 
  X, UploadCloud, DollarSign, Layers, 
  Image as ImageIcon, CheckCircle2, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import api from "../../../../api/api";
import { useAuthStore } from "../../../../store/authStore";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const { user } = useAuthStore();
  const initialState = {
    productName: "",
    description: "",
    price: "",
    offerPrice: "",
    category: "",
    stock: 0,
    status: "active",
    images: [] 
  };

  const [formData, setFormData] = useState(initialState);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
      setImagePreviews([]);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

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

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append("productName", formData.productName);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("offerPrice", formData.offerPrice);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      data.append("status", formData.status);

      // Append images
      formData.images.forEach((file) => {
        data.append("images", file);
      });

      await axios.post(api.Product.AdminCreate, data, {
        headers: { 
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data" 
        }
      });

      onProductAdded(); // Trigger refresh in parent
      onClose();
    } catch (err) {
      console.error("Create error:", err);
      alert(err.response?.data?.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
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
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" /> Basic Information
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Product Name *</label>
                    <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" />
                    {errors.productName && <p className="text-xs text-red-500">{errors.productName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Category</label>
                      <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Status</label>
                      <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none text-sm bg-white">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="outofstock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none text-sm resize-none" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Pricing & Inventory
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Price *</label>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Offer Price</label>
                      <input type="number" name="offerPrice" value={formData.offerPrice} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none text-sm" />
                      {errors.offerPrice && <p className="text-xs text-red-500">{errors.offerPrice}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Stock</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 outline-none text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Images) */}
              <div className="lg:col-span-1">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <ImageIcon className="w-4 h-4 text-blue-500" /> Images
                  </h3>
                  <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-slate-100 transition-colors">
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="text-center text-slate-400">
                      <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-xs">Click or Drop Images</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px]">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 z-10">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-70">
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} Create Product
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;