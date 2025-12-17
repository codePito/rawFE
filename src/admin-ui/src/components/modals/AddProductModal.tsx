import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import categoryApi from '../../../../src/api/categoryApi';
import { Category } from '../../types';
import { Loader2 } from 'lucide-react';
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
    if (!formData.name) e.name = 'Required';
    if (!formData.description) e.description = 'Required';
    if (!formData.price || Number(formData.price) <= 0) e.price = 'Invalid';
    if (!formData.category) e.category = 'Required';
    if (Number(formData.stockQuantity) < 0) e.stockQuantity = 'Invalid';
    if (Number(formData.lowStockThreshold) < 0) e.lowStockThreshold = 'Invalid';

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
      stockQuantity: Number(formData.stockQuantity),
      lowStockThreshold: Number(formData.lowStockThreshold),
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
            required
          />

          <Input
            label="Price"
            type="number"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            error={errors.price}
            required
          />

          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stockQuantity}
            onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
            error={errors.stockQuantity}
            required
          />

          <Input
            label="Low Stock Threshold"
            type="number"
            value={formData.lowStockThreshold}
            onChange={e =>
              setFormData({ ...formData, lowStockThreshold: e.target.value })
            }
            error={errors.lowStockThreshold}
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
