import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import api from "../../../api/api";
import { useAuthStore } from "../../../store/authStore";
import ProductHeader from "./productPage/ProductHeader";
import ProductTable from "./productPage/ProductTable";
import ProductStats from "./productPage/ProductStats";

// Removed: AddProductModal import

export default function ProductsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Removed: isAddModalOpen state

  // Central Fetch Function
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(api.Product.GetAll, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      // Handle array or wrapped data structure
      setProducts(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial Load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header - Removed onAddClick prop */}
        <ProductHeader />

        {/* Stats - Powered by real data */}
        <ProductStats products={products} />

        {/* Table - Powered by real data, triggers refresh on changes */}
        <ProductTable 
          products={products} 
          isLoading={loading} 
          onRefresh={fetchProducts} 
        />

        {/* Removed: AddProductModal component */}
      </div>
    </div>
  );
}