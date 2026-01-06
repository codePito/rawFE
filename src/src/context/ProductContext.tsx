import React, { useState, createContext, useContext, useEffect } from 'react';
import { Product, FilterOptions, ProductVariants } from '../types';
import productApi from '../api/productApi';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  applyFilters: (filters: FilterOptions) => void;
  searchProducts: (query: string) => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      const apiData = response.data;

      // Lấy danh sách sản phẩm từ API
      const rawList = apiData.result || apiData;
      const productList = Array.isArray(rawList) ? rawList : [];

      console.log('📦 Products fetched from API:', productList.length);
      console.log('📦 Raw API response:', apiData);

      // Map dữ liệu với hệ thống Image mới
      const mappedData: Product[] = productList.map((p: any) => ({
        id: p.id ? p.id.toString() : Math.random().toString(),
        name: p.name || 'No Name',
        description: p.description || '',
        price: p.price || 0,
        
        // Giá gốc và giảm giá (optional)
        originalPrice: p.originalPrice || (p.price ? p.price * 1.2 : 0),
        discount: p.discount || 0,
        
        // ✅ HỆ THỐNG IMAGE MỚI - Sử dụng primaryImageUrl và imageUrls
        images: p.imageUrls && p.imageUrls.length > 0 
          ? p.imageUrls 
          : (p.primaryImageUrl ? [p.primaryImageUrl] : ['https://via.placeholder.com/300']),
        
        category: p.categoryId ? p.categoryId.toString() : 'General',
        categoryName: p.categoryName || 'Unknown',
        
        // ✅ STOCK MANAGEMENT MỚI
        stock: p.stockQuantity ?? 100,
        isAvailable: p.isAvailable ?? true,
        isLowStock: p.isLowStock ?? false,
        isOutOfStock: p.isOutOfStock ?? false,
        lowStockThreshold: p.lowStockThreshold || 5,
        
        // Các trường rating (giữ nguyên logic cũ)
        rating: p.rating || 5,
        reviewCount: p.reviewCount || 0,
        soldCount: p.soldCount || 0,
        
        // ✅ VARIANTS - Parse with case handling
        variants: (() => {
          if (!p.variants) return undefined;
          try {
            const parsed = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
            // Normalize property names (handle both camelCase and PascalCase from backend)
            return {
              hasVariants: parsed.hasVariants ?? parsed.HasVariants ?? false,
              options: (parsed.options ?? parsed.Options ?? []).map((opt: any) => ({
                id: opt.id ?? opt.Id ?? '',
                color: opt.color ?? opt.Color ?? undefined,
                size: opt.size ?? opt.Size ?? undefined,
                stock: opt.stock ?? opt.Stock ?? 0,
                priceAdjustment: opt.priceAdjustment ?? opt.PriceAdjustment ?? 0,
                sku: opt.sku ?? opt.Sku ?? undefined,
              }))
            } as ProductVariants;
          } catch {
            return undefined;
          }
        })(),
        
        specifications: p.specifications || {}
      }));

      console.log('✅ Products mapped:', mappedData.length);
      console.log('✅ Sample product:', mappedData[0]);

      setProducts(mappedData);
      setFilteredProducts(mappedData);

    } catch (error) {
      console.error("❌ Failed to fetch products", error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    await fetchProducts();
  };

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
    setFilteredProducts(filtered);
  };

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) || 
      p.description.toLowerCase().includes(lowercaseQuery) ||
      (p.category && p.category.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category);
  };

  return (
    <ProductContext.Provider value={{
      products,
      filteredProducts,
      applyFilters,
      searchProducts,
      getProductById,
      getProductsByCategory,
      refreshProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
}