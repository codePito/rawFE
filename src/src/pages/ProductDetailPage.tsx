import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Minus, Plus, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Rating } from '../components/common/Rating';
import { Badge } from '../components/common/Badge';
import { VariantSelector } from '../components/product/VariantSelector';
import { formatCurrency, formatNumber } from '../utils/formatters';
import ProductGallery from '../components/product/ProductGallery';
import { ProductVariantOption } from '../types';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const { addToCart } = useCart();
  const { openAuthModal } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantOption | null>(null);

  const product = getProductById(productId!);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy sản phẩm</p>
          <Button onClick={() => navigate('/')}>Về Trang Chủ</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Debug log
    console.log('Product:', product);
    console.log('Product variants:', product.variants);
    console.log('Selected variant:', selectedVariant);
    
    // Kiểm tra nếu có variants thì phải chọn
    if (product.variants?.hasVariants && !selectedVariant) {
      alert('Vui lòng chọn phân loại sản phẩm');
      return;
    }

    // Kiểm tra stock
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    
    if (currentStock <= 0) {
      alert('Sản phẩm hiện đã hết hàng');
      return;
    }

    if (!product.isAvailable) {
      alert('Sản phẩm hiện không khả dụng');
      return;
    }

    if (quantity > currentStock) {
      alert(`Chỉ còn ${currentStock} sản phẩm trong kho`);
      return;
    }

    // Build variant info string
    let variantInfo: string | undefined;
    if (selectedVariant) {
      const parts: string[] = [];
      if (selectedVariant.color) parts.push(`Color: ${selectedVariant.color}`);
      if (selectedVariant.size) parts.push(`Size: ${selectedVariant.size}`);
      variantInfo = parts.join(', ');
    }

    const success = addToCart(product, quantity, selectedVariant?.id, variantInfo);
    if (!success) {
      openAuthModal();
    }
  };

  // Tính stock và giá dựa trên variant được chọn
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentPrice = selectedVariant 
    ? product.price + selectedVariant.priceAdjustment 
    : product.price;
  const isOutOfStock = currentStock <= 0;
  const maxQuantity = Math.min(currentStock, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-4 sm:p-6 lg:p-8">
            {/* Image Gallery */}
            <div>
              <ProductGallery productId={Number(product.id)} />
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                  <Rating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size="lg"
                  />
                  <span className="text-sm sm:text-base text-gray-500">
                    Đã bán {formatNumber(product.soldCount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-primary-600">
                  {formatCurrency(currentPrice)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg sm:text-xl text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                    <Badge variant="danger" size="md">
                      Giảm {product.discount}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Variant Selector */}
              {product.variants?.hasVariants && (
                <div className="border-t border-b py-4 mb-6">
                  <VariantSelector
                    variants={product.variants}
                    basePrice={product.price}
                    onSelect={setSelectedVariant}
                  />
                </div>
              )}

              {/* Stock Status - Chỉ hiện khi không có variants hoặc đã chọn variant */}
              {(!product.variants?.hasVariants || selectedVariant) && (
                <div className="border-t border-b py-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-700 font-medium">Tình trạng kho:</span>
                    {isOutOfStock ? (
                      <Badge variant="danger">Hết hàng</Badge>
                    ) : currentStock <= (product.lowStockThreshold || 5) ? (
                      <Badge variant="warning">Sắp hết (còn {currentStock})</Badge>
                    ) : (
                      <Badge variant="success">Còn hàng ({currentStock} sản phẩm)</Badge>
                    )}
                  </div>
                  {currentStock > 0 && currentStock <= (product.lowStockThreshold || 5) && (
                    <div className="flex items-center gap-2 text-sm text-primary-600 mt-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Nhanh tay! Chỉ còn {currentStock} sản phẩm</span>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-b py-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.specifications && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Thông số kỹ thuật
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center text-lg font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity || isOutOfStock}
                      className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {isOutOfStock 
                      ? 'Hết hàng' 
                      : `Tối đa ${maxQuantity} sản phẩm`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !product.isAvailable || (product.variants?.hasVariants && !selectedVariant)}
                  className="sm:flex-1"
                >
                  {isOutOfStock 
                    ? 'Hết Hàng' 
                    : product.variants?.hasVariants && !selectedVariant 
                      ? 'Chọn Phân Loại'
                      : 'Thêm Vào Giỏ'}
                </Button>
                <div className="flex gap-3 sm:w-auto">
                  <button className="flex-1 sm:flex-none w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="flex-1 sm:flex-none w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}