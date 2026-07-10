import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../../api/api"; 
import { useAuthStore } from "../../../../store/authStore";
import { X, Save, Loader2, UploadCloud, Image as ImageIcon, AlertCircle } from "lucide-react";

const EditProductModal = ({ isOpen, onClose, product, onUpdateSuccess }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    description: "",
    price: "",
    offerPrice: "",
    stock: "",
    status: "active",
  });

  // Image Handling State
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Initialize Data when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        productName: product.productName || "",
        category: product.category || "",
        description: product.description || "",
        price: product.price || 0,
        offerPrice: product.offerPrice || 0,
        stock: product.stock || 0,
        status: product.status || "active",
      });
      setExistingImages(product.images || []);
      
      // Reset new uploads
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setError("");
    }
  }, [product, isOpen]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewImageFiles(files);
      // Create preview URLs
      const previews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Frontend Validation: Offer Price <= Price
    if (Number(formData.offerPrice) > Number(formData.price)) {
      setError("Offer price cannot be greater than the main price.");
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const data = new FormData();
      
      // Append ID (Required by your controller)
      data.append("id", product._id);

      // Append text fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append images (If any new images are selected)
      // Your controller loops through req.files, so we append them one by one or as an array
      newImageFiles.forEach((file) => {
        data.append("images", file); 
      });

      // API Call
      await axios.put(api.Product.AdminUpdate, data, {
        headers: { 
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data", // Crucial for file uploads
        },
      });

      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to update product";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
            <p className="text-xs text-gray-500 mt-1">Update product details and images</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-6">
          
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form id="editProductForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Product Images</label>
              
              <div className="flex flex-col gap-4">
                {/* Upload Box */}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Click to replace images</span>
                    </p>
                    <p className="text-xs text-gray-400">New uploads will replace existing images</p>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </label>

                {/* Previews */}
                <div className="flex gap-2 overflow-x-auto py-2">
                  {newImagePreviews.length > 0 ? (
                    newImagePreviews.map((src, index) => (
                      <div key={index} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-blue-200 ring-2 ring-blue-100">
                        <img src={src} alt="New" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    ))
                  ) : (
                    existingImages.map((img, index) => (
                      <div key={index} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                        <img src={img.url} alt="Existing" className="w-full h-full object-cover opacity-75" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  name="productName" 
                  value={formData.productName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" 
                required 
              />
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-3 gap-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (₹)</label>
                <input 
                  type="number" 
                  name="offerPrice" 
                  value={formData.offerPrice} 
                  onChange={handleChange} 
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                    Number(formData.offerPrice) > Number(formData.price) 
                    ? "border-red-300 focus:ring-red-200 bg-red-50 text-red-900" 
                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                  }`} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
                <input 
                  type="number" 
                  name="stock" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="editProductForm"
            disabled={loading} 
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;