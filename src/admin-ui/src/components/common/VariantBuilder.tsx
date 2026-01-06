import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { ProductVariantOption } from '../../types';

interface VariantBuilderProps {
    variants: ProductVariantOption[];
    onChange: (variants: ProductVariantOption[]) => void;
    basePrice: number;
}

export function VariantBuilder({ variants, onChange, basePrice }: VariantBuilderProps) {
    const [newVariant, setNewVariant] = useState<Partial<ProductVariantOption>>({
        color: '',
        size: '',
        stock: 0,
        priceAdjustment: 0,
        sku: '',
    });

    const generateId = () => `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const handleAddVariant = () => {
        if (!newVariant.color && !newVariant.size) {
            alert('Vui lòng nhập ít nhất Color hoặc Size');
            return;
        }

        const variant: ProductVariantOption = {
            id: generateId(),
            color: newVariant.color || undefined,
            size: newVariant.size || undefined,
            stock: newVariant.stock || 0,
            priceAdjustment: newVariant.priceAdjustment || 0,
            sku: newVariant.sku || undefined,
        };

        onChange([...variants, variant]);
        setNewVariant({ color: '', size: '', stock: 0, priceAdjustment: 0, sku: '' });
    };

    const handleRemoveVariant = (id: string) => {
        onChange(variants.filter(v => v.id !== id));
    };

    const handleUpdateVariant = (id: string, field: keyof ProductVariantOption, value: any) => {
        onChange(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-900">Product Variants</span>
                </div>
                <span className="text-sm text-gray-500">
                    Total Stock: <span className="font-semibold">{totalStock}</span>
                </span>
            </div>

            {/* Existing Variants */}
            {variants.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Color</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Size</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Stock</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Price Adj.</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">Final Price</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600">SKU</th>
                                <th className="px-3 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {variants.map(variant => (
                                <tr key={variant.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={variant.color || ''}
                                            onChange={e => handleUpdateVariant(variant.id, 'color', e.target.value)}
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            placeholder="—"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={variant.size || ''}
                                            onChange={e => handleUpdateVariant(variant.id, 'size', e.target.value)}
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            placeholder="—"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={variant.stock}
                                            onChange={e => handleUpdateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 border rounded text-sm"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={variant.priceAdjustment}
                                            onChange={e => handleUpdateVariant(variant.id, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                                            className="w-24 px-2 py-1 border rounded text-sm"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-gray-600">
                                        {(basePrice + variant.priceAdjustment).toLocaleString('vi-VN')}đ
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={variant.sku || ''}
                                            onChange={e => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            placeholder="—"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariant(variant.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add New Variant */}
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm font-medium text-gray-700 mb-3">Add New Variant</p>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <input
                        type="text"
                        placeholder="Color"
                        value={newVariant.color || ''}
                        onChange={e => setNewVariant({ ...newVariant, color: e.target.value })}
                        className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Size"
                        value={newVariant.size || ''}
                        onChange={e => setNewVariant({ ...newVariant, size: e.target.value })}
                        className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={newVariant.stock || ''}
                        onChange={e => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                        type="number"
                        placeholder="Price +/-"
                        value={newVariant.priceAdjustment || ''}
                        onChange={e => setNewVariant({ ...newVariant, priceAdjustment: parseFloat(e.target.value) || 0 })}
                        className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                        type="text"
                        placeholder="SKU (optional)"
                        value={newVariant.sku || ''}
                        onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                        className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-500">
                Price Adjustment: Số tiền cộng/trừ vào giá gốc. VD: +50000 hoặc -20000
            </p>
        </div>
    );
}
