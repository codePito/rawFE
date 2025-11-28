import React, { useState, createContext, useContext, useEffect } from 'react';
import { Product, FilterOptions } from '../types';
import productApi from '../api/productApi';


interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  applyFilters: (filters: FilterOptions) => void;
  searchProducts: (query: string) => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
}
const ProductContext = createContext<ProductContextType | undefined>(undefined);
export function ProductProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilterdProducts] = useState<Product[]>([]);
  useEffect(() => {
  const fectchProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
      setFilterdProducts(response.data);
    } catch(error) {
      console.error("Failed to fetch products", error);
    }
  };
  fectchProducts();
}, []);

  const applyFilters = (filters: FilterOptions) => {
    let filtered = [...products];
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.minRating !== undefined) {
      filtered = filtered.filter(p => p.rating >= filters.minRating!);
    }
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          filtered.sort((a, b) => b.soldCount - a.soldCount);
          break;
      }
    }
    setFilterdProducts(filtered);
  };
  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lowercaseQuery) || p.description.toLowerCase().includes(lowercaseQuery) || p.category.toLowerCase().includes(lowercaseQuery));
  };
  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };
  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category);
  };
  return <ProductContext.Provider value={{
    products,
    filteredProducts,
    applyFilters,
    searchProducts,
    getProductById,
    getProductsByCategory
  }}>
      {children}
    </ProductContext.Provider>;
}
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
}