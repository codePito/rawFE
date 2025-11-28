import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ProductGrid } from '../components/product/ProductGrid';
import { SortFilter } from '../components/product/SortFilter';
import { CategoryFilter } from '../components/product/CategoryFilter';
import { SortOption } from '../types';
// import { categories } from '../api/mockData';
export function CategoryPage() {
  const {
    categoryId
  } = useParams<{
    categoryId: string;
  }>();
  const {
    applyFilters,
    filteredProducts
  } = useProducts();
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  // const category = categories.find(c => c.id === categoryId);
  useEffect(() => {
    applyFilters({
      category: categoryId,
      sortBy
    });
  }, [categoryId, sortBy, applyFilters]);
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryFilter />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {/* {category?.icon} {category?.name} */}
            </h1>
            <p className="text-gray-600">
              {filteredProducts.length} products found
            </p>
          </div>
          <SortFilter value={sortBy} onChange={setSortBy} />
        </div>

        <ProductGrid products={filteredProducts} />
      </div>
    </div>;
}