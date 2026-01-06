// File: src/src/context/CartContext.tsx

import React, { useEffect, useState, createContext, useContext } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import cartApi from '../api/cartApi';
import imageApi, { getImageUrl } from '../api/imageApi';

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number, variantId?: string, variantInfo?: string) => Promise<boolean>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cache ảnh sản phẩm để không gọi API nhiều lần
const imageCache: Record<string, string> = {};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    // Hàm lấy ảnh sản phẩm (có cache)
    const getProductImage = async (productId: number): Promise<string> => {
        const cacheKey = `product_${productId}`;
        
        // Kiểm tra cache
        if (imageCache[cacheKey]) {
            return imageCache[cacheKey];
        }

        try {
            // Thử lấy ảnh primary
            const res = await imageApi.getPrimaryImage('Product', productId);
            if (res?.data?.url) {
                const url = getImageUrl(res.data.url);
                imageCache[cacheKey] = url;
                return url;
            }
        } catch {
            // Không có ảnh primary, thử lấy danh sách ảnh
            try {
                const res = await imageApi.getProductImages(productId);
                if (res?.data?.length > 0) {
                    const url = getImageUrl(res.data[0].url);
                    imageCache[cacheKey] = url;
                    return url;
                }
            } catch {
                // Không có ảnh
            }
        }

        // Fallback placeholder
        return '/placeholder-image.svg';
    };

    // Hàm lấy giỏ hàng từ API
    const fetchCart = async () => {
        if (!isAuthenticated) {
            setItems([]);
            return;
        }

        try {
            const response = await cartApi.getCart();
            console.log('Cart API response:', response.data);
            console.log('Cart items detail:', JSON.stringify(response.data.items, null, 2));
            const backendItems = response.data.items || [];

            // Map dữ liệu Backend -> Frontend
            const mappedItems: CartItem[] = await Promise.all(
                backendItems.map(async (item: any) => {
                    // Lấy ảnh sản phẩm
                    // Ưu tiên dùng productImageUrl từ backend nếu có
                    let imageUrl = item.productImageUrl;
                    
                    if (!imageUrl) {
                        // Fallback: gọi API lấy ảnh
                        imageUrl = await getProductImage(item.productId);
                    } else {
                        imageUrl = getImageUrl(imageUrl);
                    }

                    return {
                        id: item.id.toString(),
                        quantity: item.quantity,
                        variantId: item.variantId || undefined,
                        variantInfo: item.variantInfo || undefined,
                        product: {
                            id: item.productId.toString(),
                            name: item.productName,
                            price: item.price,
                            images: [imageUrl],
                            description: '',
                            category: '',
                            rating: 5,
                            reviewCount: 0,
                            soldCount: 0,
                            stock: 100,
                            isAvailable: true,
                        } as Product
                    };
                })
            );

            setItems(mappedItems);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    };

    // Gọi API mỗi khi trạng thái đăng nhập thay đổi
    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    const addToCart = async (product: Product, quantity: number = 1, variantId?: string, variantInfo?: string): Promise<boolean> => {
        if (!isAuthenticated) return false;

        try {
            console.log('Adding to cart:', { productId: product.id, quantity, variantId, variantInfo });
            const response = await cartApi.addToCart(product.id, quantity, variantId);
            console.log('Add to cart response:', response.data);
            await fetchCart();
            setIsCartOpen(true);
            return true;
        } catch (error) {
            console.error("Error adding to cart:", error);
            return false;
        }
    };

    const removeFromCart = async (cartItemId: string) => {
        if (!isAuthenticated) return;
        try {
            await cartApi.removeFromCart(cartItemId);
            await fetchCart();
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        if (!isAuthenticated) return;

        if (quantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }

        try {
            await cartApi.updateQuantity(cartItemId, quantity);
            await fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const clearCart = () => {
        setItems([]);
    };

    const getCartTotal = () => {
        return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
            isCartOpen,
            openCart,
            closeCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
