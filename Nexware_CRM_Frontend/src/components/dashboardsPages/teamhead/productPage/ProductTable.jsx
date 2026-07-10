import React, { useState } from "react";
import axios from "axios";
import api from "../../../../api/api";
import { useAuthStore } from "../../../../store/authStore";
import { MoreHorizontal, Search, Filter, Package, Edit, Trash2 } from "lucide-react";
import ProductDetailsModal from "./ProductDetailsModal";
import EditProductModal from "./EditProductModal";

const ProductTable = ({ products, isLoading, onRefresh }) => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [productToEdit, setProductToEdit] = useState(null);    
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 

  const userRole = user?.role || "user";
  const canEdit = userRole === 'admin' || userRole === 'subadmin';
  const canDelete = userRole === 'admin';

  const handleDelete = async (id) => {
    if (!window.confirm("Once deleted, it cannot be recovered. Are you sure?")) return;
    try {
      await axios.delete(api.Product.AdminDelete, {
        headers: { Authorization: `Bearer ${user?.token}` },
        data: { id: id } 
      });
      onRefresh(); // Trigger parent refresh
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'outofstock': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Package className="w-10 h-10 mb-2 opacity-20" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400 m-auto mt-2" />
                          )}
                        </div>
                        <div>
                          <span className="block font-medium text-slate-900">{product.productName}</span>
                          <span className="block text-xs text-slate-500">{product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{product.price}</td>
                    <td className="px-6 py-4 text-slate-600">{product.stock} units</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedProduct(product)} className="p-2 text-slate-400 hover:text-blue-600"><MoreHorizontal className="w-5 h-5" /></button>
                        {canEdit && <button onClick={() => { setProductToEdit(product); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600"><Edit className="w-4 h-4" /></button>}
                        {canDelete && <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      
      <EditProductModal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setProductToEdit(null); }} 
        product={productToEdit} 
        onUpdateSuccess={onRefresh} 
      />
    </>
  );
};

export default ProductTable;