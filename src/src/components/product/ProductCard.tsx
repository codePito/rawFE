import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Rating } from '../common/Rating';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import ProductThumbnail from './ProductThumbnail';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { openAuthModal } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Kiểm tra stock trước khi thêm vào giỏ
    if (product.isOutOfStock) {
      alert('This product is currently out of stock');
      return;
    }
    
    if (!product.isAvailable) {
      alert('This product is currently unavailable');
      return;
    }
    
    const success = addToCart(product);
    if (!success) {
      openAuthModal();
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <div className="h-48 w-full overflow-hidden">
                <ProductThumbnail 
                    productId={Number(product.id)} 
                    className="hover:scale-110 transition-transform duration-300" 
                />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount && (
            <Badge variant="danger">-{product.discount}%</Badge>
          )}
          {product.isOutOfStock && (
            <Badge variant="danger">Out of Stock</Badge>
          )}
          {product.isLowStock && !product.isOutOfStock && (
            <Badge variant="warning">Low Stock</Badge>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>

        <div className="mb-2">
          <Rating 
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
          />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-orange-600">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            {formatNumber(product.soldCount)} sold
          </p>
          {!product.isOutOfStock && product.stock <= 10 && (
            <p className="text-xs text-orange-600 font-medium">
              Only {product.stock} left!
            </p>
          )}
        </div>

        <Button
          variant={product.isOutOfStock ? "secondary" : "primary"}
          size="sm"
          fullWidth
          onClick={handleAddToCart}
          disabled={product.isOutOfStock || !product.isAvailable}
          className="mt-auto"
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" />
          {product.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </Link>
  );
}