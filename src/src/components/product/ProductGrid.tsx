import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}
export function ProductGrid({
  products,
  emptyMessage = 'Không tìm thấy sản phẩm'
}: ProductGridProps) {
  if (products.length === 0) {
    return <div className="text-center py-16">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>;
  }
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>;
}