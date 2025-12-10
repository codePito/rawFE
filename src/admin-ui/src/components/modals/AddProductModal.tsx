import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { ImageUpload } from '../common/ImageUpload';
import categoryApi from '../../../../src/api/categoryApi'; 
import { Category } from '../../types';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  // === KHẮC PHỤC LỖI TS: THÊM fullWidth ===
  fullWidth?: boolean;
  children: React.ReactNode;
}
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  // === DESTRUCTURE fullWidth ===
  fullWidth = false, 
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // === LOGIC THÊM w-full ===
  const widthClass = fullWidth ? 'w-full' : '';

  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => Promise<boolean>; 
}
interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
}

interface ProductFormErrors {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  images?: string; // Sửa thành string (chuỗi) để chứa thông báo lỗi
}
// ==========================================================

export function AddProductModal({
  isOpen,
  onClose,
  onAdd
}: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    images: []
  });
  // === CẬP NHẬT KIỂU DỮ LIỆU CỦA STATE ERRORS ===
  const [errors, setErrors] = useState<ProductFormErrors>({});
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // Thêm state cho Categories

  // =======================================================
  // FETCH CATEGORIES
  // =======================================================
  const fetchCategories = useCallback(async () => {
    try {
        const response = await categoryApi.getAll();
        const rawList = response.data.result || response.data || [];
        
        // Ánh xạ dữ liệu danh mục
        const mappedCategories: Category[] = rawList.map((c: any) => ({
            id: c.id?.toString() || c.Id?.toString() || c.name,
            name: c.name || 'Unnamed Category',
            slug: c.slug || '',
            icon: c.icon || '📦',
            productCount: c.productCount || 0, 
            status: (c.status || 'active') as any,
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        }));
        setCategories(mappedCategories);
    } catch (error) {
        console.error("Failed to fetch categories in modal:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
        fetchCategories(); // Gọi API khi modal mở
    }
  }, [isOpen, fetchCategories]);
  // =======================================================

  const validateForm = (): boolean => {
    // === CẬP NHẬT KIỂU DỮ LIỆU CỦA newErrors ===
    const newErrors: ProductFormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    // Lỗi đã được khắc phục ở đây
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    const mappedImages = formData.images.map((url, index) => ({
      FilePath: url,

      IsPrimary: index == 0,
    }));

    // Chuẩn bị payload cho API Product Create
    const productPayload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: formData.category, // Cần gửi categoryId
      images: mappedImages,
      stock: 100, // Giá trị mặc định
      sku: `SKU-${Date.now()}`,
      status: 'active',
    };
    
    // Gọi hàm onAdd (hàm productApi.create từ ProductsPage)
    const success = await onAdd(productPayload);
    
    setLoading(false);
    
    if (success) {
        handleClose();
    } 
    // Nếu thất bại, ProductsPage sẽ hiển thị alert
  };
  
  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      images: []
    });
    setErrors({}); // Khởi tạo lại lỗi bằng đối tượng rỗng
    onClose();
  };
  
  // Tạo options từ categories đã fetch
  const categoryOptions = categories
    .filter(cat => cat.status === 'active')
    .map(cat => ({
        value: cat.id,
        label: `${cat.name} `
    }));

  return <Modal isOpen={isOpen} onClose={handleClose} title="Add New Product" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <Input label="Product Name" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} placeholder="Enter product name" error={errors.name} required />

        {/* Description */}
        <Textarea label="Description" value={formData.description} onChange={e => setFormData({
        ...formData,
        description: e.target.value
      })} placeholder="Enter product description" rows={4} error={errors.description} required />

        {/* Price */}
        <Input label="Price" type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({
        ...formData,
        price: e.target.value
      })} placeholder="0.00" error={errors.price} required />

        {/* Category */}
        <div>
          <Select 
            label="Category" 
            value={formData.category} 
            onChange={value => setFormData({ ...formData, category: value })} 
            options={categoryOptions} // Dùng options từ API
            placeholder="Select a category" 
            error={errors.category} 
            required 
          />
          <p className="mt-1 text-sm text-gray-500">
            Manage categories in the{' '}
            <a href="/admin/categories" className="text-primary-600 hover:text-primary-700 font-medium">
              Categories page
            </a>
          </p>
        </div>

        {/* Images */}
        <ImageUpload label="Product Images" value={formData.images} onChange={images => setFormData({
        ...formData,
        images
      })} maxImages={5} error={errors.images} />

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Add Product
          </Button>
        </div>
      </form>
    </Modal>;
}