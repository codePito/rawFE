import { useState, useEffect } from 'react';
import { ProductVariants, ProductVariantOption } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface VariantSelectorProps {
    variants: ProductVariants;
    basePrice: number;
    onSelect: (variant: ProductVariantOption | null) => void;
}

export function VariantSelector({ variants, basePrice, onSelect }: VariantSelectorProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // Lấy danh sách unique colors và sizes
    const colors = [...new Set(variants.options.map(v => v.color).filter(Boolean))] as string[];
    const sizes = [...new Set(variants.options.map(v => v.size).filter(Boolean))] as string[];

    // Tìm variant phù hợp với selection
    const findMatchingVariant = (): ProductVariantOption | null => {
        return variants.options.find(v => {
            const colorMatch = !colors.length || v.color === selectedColor;
            const sizeMatch = !sizes.length || v.size === selectedSize;
            return colorMatch && sizeMatch;
        }) || null;
    };

    // Kiểm tra xem combination có available không
    const isOptionAvailable = (type: 'color' | 'size', value: string): boolean => {
        return variants.options.some(v => {
            if (type === 'color') {
                const sizeMatch = !selectedSize || v.size === selectedSize;
                return v.color === value && sizeMatch && v.stock > 0;
            } else {
                const colorMatch = !selectedColor || v.color === selectedColor;
                return v.size === value && colorMatch && v.stock > 0;
            }
        });
    };

    // Notify parent khi selection thay đổi
    useEffect(() => {
        const variant = findMatchingVariant();
        onSelect(variant);
    }, [selectedColor, selectedSize]);

    // Auto-select nếu chỉ có 1 option
    useEffect(() => {
        if (colors.length === 1 && !selectedColor) setSelectedColor(colors[0]);
        if (sizes.length === 1 && !selectedSize) setSelectedSize(sizes[0]);
    }, []);

    const selectedVariant = findMatchingVariant();

    return (
        <div className="space-y-4">
            {/* Color Selector */}
            {colors.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màu sắc: <span className="text-gray-900">{selectedColor || 'Chọn'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map(color => {
                            const available = isOptionAvailable('color', color);
                            const isSelected = selectedColor === color;
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    disabled={!available}
                                    className={`
                                        px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                        ${isSelected 
                                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                                            : 'border-gray-200 hover:border-gray-300'}
                                        ${!available ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
                                    `}
                                >
                                    {color}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kích thước: <span className="text-gray-900">{selectedSize || 'Chọn'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map(size => {
                            const available = isOptionAvailable('size', size);
                            const isSelected = selectedSize === size;
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(size)}
                                    disabled={!available}
                                    className={`
                                        min-w-[48px] px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                        ${isSelected 
                                            ? 'border-primary-500 bg-primary-50 text-primary-700' 
                                            : 'border-gray-200 hover:border-gray-300'}
                                        ${!available ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
                                    `}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Variant Info */}
            {selectedVariant && (
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            Kho: <span className={selectedVariant.stock > 5 ? 'text-green-600' : 'text-orange-600'}>
                                Còn {selectedVariant.stock} sản phẩm
                            </span>
                        </span>
                        {selectedVariant.priceAdjustment !== 0 && (
                            <span className="text-sm">
                                Giá: <span className="font-semibold text-primary-600">
                                    {formatCurrency(basePrice + selectedVariant.priceAdjustment)}
                                </span>
                                {selectedVariant.priceAdjustment > 0 && (
                                    <span className="text-xs text-gray-500 ml-1">
                                        (+{formatCurrency(selectedVariant.priceAdjustment)})
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Warning if no variant selected */}
            {!selectedVariant && (colors.length > 0 || sizes.length > 0) && (
                <p className="text-sm text-orange-600">
                    Vui lòng chọn {colors.length > 0 && !selectedColor ? 'màu sắc' : ''} 
                    {colors.length > 0 && !selectedColor && sizes.length > 0 && !selectedSize ? ' và ' : ''}
                    {sizes.length > 0 && !selectedSize ? 'kích thước' : ''}
                </p>
            )}
        </div>
    );
}
