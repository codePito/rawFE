import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
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
interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}
export function AddCategoryModal({
  isOpen,
  onClose,
  onAdd
}: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    onAdd(categoryName);
    setLoading(false);
    setCategoryName('');
    onClose();
  };
  const handleClose = () => {
    setCategoryName('');
    setError('');
    onClose();
  };
  return <Modal isOpen={isOpen} onClose={handleClose} title="Add New Category" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Category Name" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="Enter category name" error={error} required />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Add Category
          </Button>
        </div>
      </form>
    </Modal>;
}