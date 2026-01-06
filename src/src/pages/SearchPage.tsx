import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { SortFilter } from '../components/product/SortFilter';
import { SortOption, Product } from '../types';
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const {
    searchProducts
  } = useProducts();
  const [results, setResults] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  useEffect(() => {
    if (query) {
      let searchResults = searchProducts(query);
      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          searchResults.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          searchResults.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          searchResults.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          searchResults.sort((a, b) => b.soldCount - a.soldCount);
          break;
      }
      setResults(searchResults);
    }
  }, [query, sortBy, searchProducts]);
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kết quả tìm kiếm
            </h1>
            <p className="text-gray-600">
              {results.length} kết quả cho "{query}"
            </p>
          </div>
          <SortFilter value={sortBy} onChange={setSortBy} />
        </div>

        <ProductGrid products={results} emptyMessage={`Không tìm thấy sản phẩm cho "${query}"`} />
      </div>
    </div>;
}