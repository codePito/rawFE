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
  // File: src/src/context/ProductContext.tsx

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      const apiData = response.data;

      const rawList = apiData.result || apiData

      // 1. Lấy mảng sản phẩm từ thuộc tính "result"
      // Nếu apiData.result undefined thì fallback về mảng rỗng
      const productList = Array.isArray(rawList) ? rawList : [];

      // 2. Map dữ liệu từ cấu trúc API sang cấu trúc Frontend
      const mappedData = productList.map((p: any) => ({
        // Chuyển id từ số sang chuỗi để khớp với type Product của frontend
        id: p.id ? p.id.toString() : Math.random().toString(),
        
        name: p.name || 'No Name',
        description: p.description || '',
        price: p.price || 0,
        
        // Tạo dữ liệu giả cho các trường API chưa có để giao diện đẹp hơn
        originalPrice: p.price ? p.price * 1.2 : 0, 
        discount: 0,
        
        // Xử lý mảng ảnh: Lấy filePath từ đối tượng ảnh
        images: (p.images && p.images.length > 0)
          ? p.images.map((img: any) => img.filePath || 'https://via.placeholder.com/300')
          : ['https://via.placeholder.com/300'], // Ảnh mặc định nếu không có
          
        category: p.categoryId ? p.categoryId.toString() : 'General',
        
        // Các trường này API chưa có, set mặc định để không lỗi UI
        rating: 5,
        reviewCount: 0,
        soldCount: 0,
        stock: 100,
        specifications: {}
      }));

      // 3. Cập nhật state
      setProducts(mappedData);
      setFilterdProducts(mappedData);

    } catch (error) {
      console.error("Failed to fetch products", error);
      setProducts([]);
      setFilterdProducts([]);
    }
  };

  fetchProducts();
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