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
  const { openAuthModal, isAuthenticated } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập trước
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      openAuthModal();
      return;
    }
    
    // Kiểm tra stock trước khi thêm vào giỏ
    if (product.isOutOfStock) {
      alert('Sản phẩm hiện đã hết hàng');
      return;
    }
    
    if (!product.isAvailable) {
      alert('Sản phẩm hiện không khả dụng');
      return;
    }
    
    await addToCart(product);
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
          {!!product.discount && (
            <Badge variant="danger">-{product.discount}%</Badge>
          )}
          {product.isOutOfStock && (
            <Badge variant="danger">Hết hàng</Badge>
          )}
          {product.isLowStock && !product.isOutOfStock && (
            <Badge variant="warning">Sắp hết</Badge>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        <div className="mb-2">
          <Rating 
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
          />
        </div>

        <div className="flex items-baseline gap-1 sm:gap-2 mb-2">
          <span className="text-lg sm:text-xl font-bold text-primary-600">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs">
          <p className="text-gray-500">
            Đã bán {formatNumber(product.soldCount)}
          </p>
          {!product.isOutOfStock && product.stock <= 10 && (
            <p className="text-primary-600 font-medium">
              Còn {product.stock}
            </p>
          )}
        </div>

        <Button
          variant={product.isOutOfStock ? "secondary" : "primary"}
          size="sm"
          fullWidth
          onClick={handleAddToCart}
          disabled={product.isOutOfStock || !product.isAvailable}
          className="mt-auto text-xs sm:text-sm"
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
          {product.isOutOfStock ? 'Hết Hàng' : 'Thêm Vào Giỏ'}
        </Button>
      </div>
    </Link>
  );
}