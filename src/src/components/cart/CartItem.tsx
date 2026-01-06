import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

interface CartItemProps {
    item: CartItemType;
}

const PLACEHOLDER_IMAGE = '/placeholder-image.svg';

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();
    const { product, quantity } = item;

    // Lấy ảnh đầu tiên hoặc placeholder
    const imageUrl = product.images?.[0] || PLACEHOLDER_IMAGE;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = PLACEHOLDER_IMAGE;
    };

    return (
        <div className="flex gap-3 bg-gray-50 rounded-lg p-3">
            {/* Product Image */}
            <div className="w-20 h-20 flex-shrink-0 bg-white rounded overflow-hidden">
                {imageUrl && imageUrl !== PLACEHOLDER_IMAGE ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="w-8 h-8 text-gray-300" />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {product.name}
                </h3>
                
                {/* Variant Info */}
                {item.variantInfo && (
                    <p className="text-xs text-gray-500 mb-1">
                        {item.variantInfo}
                    </p>
                )}
                
                <p className="text-primary-600 font-bold mb-2">
                    {formatCurrency(product.price)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove item"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
    );
}
