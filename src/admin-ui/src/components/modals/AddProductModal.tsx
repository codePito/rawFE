import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { VariantBuilder } from '../common/VariantBuilder';
import categoryApi from '../../../../src/api/categoryApi';
import { Category, ProductVariantOption } from '../../types';
import { Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminProductImageManager from '../../pages/products/AdminProductImageManager';

/* ================= BUTTON ================= */

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
  const base =
    'rounded-lg font-medium transition inline-flex items-center justify-center disabled:opacity-50';
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

/* ================= TYPES ================= */

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => Promise<number | null>; // ⚠️ trả về productId
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

/* ================= COMPONENT ================= */

export function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '100',
    lowStockThreshold: '5',
    hasVariants: false,
    variants: [],
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);

  /* ===== FETCH CATEGORY ===== */

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.getAll();
      const list = res.data.result || res.data || [];
      setCategories(
        list.map((c: any) => ({
          id: c.id?.toString(),
          name: c.name,
          slug: c.slug,
          icon: c.icon || '📦',
          productCount: c.productCount || 0,
          status: c.status,
          createdAt: new Date(),
        }))
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen, fetchCategories]);

  /* ===== VALIDATE ===== */

  const validateForm = () => {
    const e: ProductFormErrors = {};
    
    // Name validation (3-200 chars)
    if (!formData.name.trim()) {
      e.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      e.name = 'Name must be at least 3 characters';
    } else if (formData.name.length > 200) {
      e.name = 'Name cannot exceed 200 characters';
    }
    
    // Description validation (20-2000 chars)
    if (!formData.description.trim()) {
      e.description = 'Product description is required';
    } else if (formData.description.length < 20) {
      e.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 2000) {
      e.description = 'Description cannot exceed 2000 characters';
    }
    
    // Price validation (> 0)
    if (!formData.price) {
      e.price = 'Product price is required';
    } else if (Number(formData.price) <= 0) {
      e.price = 'Product price must be greater than 0';
    }
    
    // Category validation
    if (!formData.category) {
      e.category = 'Category is required';
    }
    
    // Stock validation - chỉ validate khi không có variants
    if (!formData.hasVariants) {
      if (formData.stockQuantity === '') {
        e.stockQuantity = 'Stock quantity is required';
      } else if (Number(formData.stockQuantity) < 0) {
        e.stockQuantity = 'Stock quantity cannot be negative';
      }
    } else {
      // Validate variants
      if (formData.variants.length === 0) {
        alert('Please add at least one variant');
        return false;
      }
    }
    
    // Low stock threshold validation (>= 0)
    if (formData.lowStockThreshold === '') {
      e.lowStockThreshold = 'Low stock threshold is required';
    } else if (Number(formData.lowStockThreshold) < 0) {
      e.lowStockThreshold = 'Low stock threshold cannot be negative';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ===== SUBMIT ===== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      categoryId: formData.category,
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

    try {
      const productId = await onAdd(payload);
      if (productId) setCreatedProductId(productId);
    } finally {
      setLoading(false);
    }
  };

  /* ===== CLOSE ===== */

  const handleClose = () => {
    setCreatedProductId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stockQuantity: '100',
      lowStockThreshold: '5',
      hasVariants: false,
      variants: [],
    });
    setErrors({});
    onClose();
  };

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: c.name,
  }));

  /* ================= RENDER ================= */

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Product" size="lg">
      {!createdProductId ? (
        /* ===== STEP 1 ===== */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Product Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Enter product name"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              3-200 characters • {formData.name.length}/200
            </p>
          </div>

          <div>
            <Textarea
              label="Description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              error={errors.description}
              placeholder="Enter detailed product description"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              20-2000 characters • {formData.description.length}/2000
            </p>
          </div>

          <div>
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              error={errors.price}
              placeholder="0.00"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Must be greater than 0</p>
          </div>

          {!formData.hasVariants && (
            <div>
              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                error={errors.stockQuantity}
                placeholder="100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Cannot be negative</p>
            </div>
          )}

          <div>
            <Input
              label="Low Stock Threshold"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={e =>
                setFormData({ ...formData, lowStockThreshold: e.target.value })
              }
              error={errors.lowStockThreshold}
              placeholder="5"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Alert when stock falls below this number</p>
          </div>

          <Select
            label="Category"
            value={formData.category}
            onChange={v => setFormData({ ...formData, category: v })}
            options={categoryOptions}
            error={errors.category}
            required
          />

          {/* Variant Toggle */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900">Product Variants</p>
                <p className="text-sm text-gray-500">Enable if product has multiple options (color, size, etc.)</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasVariants: !formData.hasVariants, variants: [] })}
                className="flex items-center gap-2 text-primary-600"
              >
                {formData.hasVariants ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            {formData.hasVariants && (
              <VariantBuilder
                variants={formData.variants}
                onChange={(variants) => setFormData({ ...formData, variants })}
                basePrice={Number(formData.price) || 0}
              />
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
              Cancel
            </Button>
            <Button type="submit" loading={loading} fullWidth>
              Create & Add Images
            </Button>
          </div>
        </form>
      ) : (
        /* ===== STEP 2 ===== */
        <div className="space-y-4 animate-fade-in">
          <div className="p-3 bg-green-50 text-green-700 rounded">
            Product created successfully. Upload images below.
          </div>

          <AdminProductImageManager productId={createdProductId} />

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleClose}>Finish</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
