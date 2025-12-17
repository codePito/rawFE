import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Minus, Plus, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Rating } from '../components/common/Rating';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatNumber } from '../utils/formatters';
import ProductGallery from '../components/product/ProductGallery';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const { addToCart } = useCart();
  const { openAuthModal } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = getProductById(productId!);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Product not found</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Kiểm tra stock
    if (product.isOutOfStock) {
      alert('This product is currently out of stock');
      return;
    }

    if (!product.isAvailable) {
      alert('This product is currently unavailable');
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    const success = addToCart(product, quantity);
    if (!success) {
      openAuthModal();
    }
  };

  const maxQuantity = Math.min(product.stock, 10); // Giới hạn tối đa 10 hoặc stock

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <ProductGallery productId={Number(product.id)} />
    <div className="product-info">
        {/* Thông tin tên, giá, nút mua hàng... */}
    </div>
</div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-3">
                  <Rating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size="lg"
                  />
                  <span className="text-gray-500">
                    {formatNumber(product.soldCount)} sold
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-orange-600">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                    <Badge variant="danger" size="md">
                      Save {product.discount}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="border-t border-b py-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-700 font-medium">Stock Status:</span>
                  {product.isOutOfStock ? (
                    <Badge variant="danger">Out of Stock</Badge>
                  ) : product.isLowStock ? (
                    <Badge variant="warning">Low Stock ({product.stock} left)</Badge>
                  ) : (
                    <Badge variant="success">In Stock ({product.stock} available)</Badge>
                  )}
                </div>
                {product.isLowStock && !product.isOutOfStock && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 mt-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hurry! Only {product.stock} items left</span>
                  </div>
                )}
              </div>

              <div className="border-t border-b py-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.specifications && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Specifications
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
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.isOutOfStock}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center text-lg font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity || product.isOutOfStock}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500">
                    {product.isOutOfStock 
                      ? 'Out of stock' 
                      : `Max ${maxQuantity} items`}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={product.isOutOfStock || !product.isAvailable}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <button className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}