import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { VariantBuilder } from '../common/VariantBuilder';
import { Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import categoryApi from '../../../../src/api/categoryApi';
import AdminProductImageManager from '../../pages/products/AdminProductImageManager';
import { ProductVariantOption } from '../../types';

// ═══════════════════════════════════════════════════════════════
// BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

function Button({
    variant = 'primary',
    loading = false,
    fullWidth = false,
    className = '',
    children,
    disabled,
    ...props
}: ButtonProps) {
    const base = 'rounded-lg font-medium transition inline-flex items-center justify-center disabled:opacity-50';
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} px-4 py-2 ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    lowStockThreshold?: number;
    variants?: string | null;
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onUpdate: (id: string, data: any) => Promise<boolean>;
}

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    category: string;
    stockQuantity: string;
    lowStockThreshold: string;
    hasVariants: boolean;
    variants: ProductVariantOption[];
}

interface ProductFormErrors {
    name?: string;
    description?: string;
    price?: string;
    category?: string;
    stockQuantity?: string;
    lowStockThreshold?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export function EditProductModal({ isOpen, onClose, product, onUpdate }: EditProductModalProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '0',
        lowStockThreshold: '5',
        hasVariants: false,
        variants: [],
    });
    const [errors, setErrors] = useState<ProductFormErrors>({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'variants' | 'images'>('info');

    // Parse variants from product
    const parseVariants = (variantsStr: string | null | undefined): { hasVariants: boolean; variants: ProductVariantOption[] } => {
        if (!variantsStr) return { hasVariants: false, variants: [] };
        try {
            const parsed = JSON.parse(variantsStr);
            return {
                hasVariants: parsed.hasVariants || false,
                variants: parsed.options || [],
            };
        } catch {
            return { hasVariants: false, variants: [] };
        }
    };

    // Load product data when modal opens
    useEffect(() => {
        if (product && isOpen) {
            const { hasVariants, variants } = parseVariants(product.variants);
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                category: product.category || '',
                stockQuantity: product.stock?.toString() || '0',
                lowStockThreshold: product.lowStockThreshold?.toString() || '5',
                hasVariants,
                variants,
            });
            setActiveTab('info');
        }
    }, [product, isOpen]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryApi.getAll();
            const list = res.data.result || res.data || [];
            setCategories(
                list.map((c: any) => ({
                    id: c.id?.toString(),
                    name: c.name,
                }))
            );
        } catch (e) {
            console.error('Failed to fetch categories:', e);
        }
    }, []);

    useEffect(() => {
        if (isOpen) fetchCategories();
    }, [isOpen, fetchCategories]);

    // Validate form
    const validateForm = () => {
        const e: ProductFormErrors = {};
        if (!formData.name.trim()) e.name = 'Product name is required';
        if (!formData.description.trim()) e.description = 'Description is required';
        if (!formData.price || Number(formData.price) <= 0) e.price = 'Price must be greater than 0';
        if (!formData.category) e.category = 'Category is required';
        
        // Stock validation - chỉ validate khi không có variants
        if (!formData.hasVariants) {
            if (Number(formData.stockQuantity) < 0) e.stockQuantity = 'Stock cannot be negative';
        }
        
        if (Number(formData.lowStockThreshold) < 0) e.lowStockThreshold = 'Threshold cannot be negative';

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !product) return;

        setLoading(true);
        try {
            const payload = {
                id: Number(product.id),
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                categoryId: Number(formData.category),
                stockQuantity: formData.hasVariants
                    ? formData.variants.reduce((sum, v) => sum + v.stock, 0)
                    : Number(formData.stockQuantity),
                lowStockThreshold: Number(formData.lowStockThreshold),
                variants: formData.hasVariants
                    ? JSON.stringify({
                        hasVariants: true,
                        options: formData.variants,
                    })
                    : null,
            };

            const success = await onUpdate(product.id, payload);
            if (success) {
                handleClose();
            }
        } finally {
            setLoading(false);
        }
    };

    // Close modal
    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stockQuantity: '0',
            lowStockThreshold: '5',
            hasVariants: false,
            variants: [],
        });
        setErrors({});
        setActiveTab('info');
        onClose();
    };

    const categoryOptions = categories.map(c => ({
        value: c.id,
        label: c.name,
    }));

    if (!product) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Product: ${product.name}`} size="lg">
            {/* Tabs */}
            <div className="flex border-b mb-4">
                <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'info'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Product Info
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('variants')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'variants'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Variants
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('images')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'images'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Images
                </button>
            </div>

            {activeTab === 'info' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Product Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                        required
                    />

                    <Textarea
                        label="Description"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        error={errors.description}
                        rows={4}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            error={errors.price}
                            required
                        />

                        <Select
                            label="Category"
                            value={formData.category}
                            onChange={v => setFormData({ ...formData, category: v })}
                            options={categoryOptions}
                            error={errors.category}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Stock Quantity"
                            type="number"
                            value={formData.stockQuantity}
                            onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                            error={errors.stockQuantity}
                            required
                            disabled={formData.hasVariants}
                        />

                        <Input
                            label="Low Stock Threshold"
                            type="number"
                            value={formData.lowStockThreshold}
                            onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                            error={errors.lowStockThreshold}
                            required
                        />
                    </div>

                    {formData.hasVariants && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                            Stock is managed by variants. Go to Variants tab to edit.
                        </p>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} fullWidth>
                            Save Changes
                        </Button>
                    </div>
                </form>
            ) : activeTab === 'variants' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Variant Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Enable Variants</p>
                            <p className="text-sm text-gray-500">Product has multiple options (color, size, etc.)</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ 
                                ...formData, 
                                hasVariants: !formData.hasVariants,
                                variants: !formData.hasVariants ? formData.variants : []
                            })}
                            className="flex items-center gap-2 text-primary-600"
                        >
                            {formData.hasVariants ? (
                                <ToggleRight className="w-10 h-10" />
                            ) : (
                                <ToggleLeft className="w-10 h-10 text-gray-400" />
                            )}
                        </button>
                    </div>

                    {formData.hasVariants ? (
                        <VariantBuilder
                            variants={formData.variants}
                            onChange={(variants) => {
                                const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
                                setFormData({ 
                                    ...formData, 
                                    variants,
                                    stockQuantity: totalStock.toString()
                                });
                            }}
                            basePrice={Number(formData.price) || 0}
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Enable variants to add product options like color, size, etc.</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading} fullWidth>
                            Save Changes
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <AdminProductImageManager productId={Number(product.id)} />
                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={handleClose}>Done</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default EditProductModal;
