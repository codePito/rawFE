import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { AddProductModal } from '../../components/modals/AddProductModal';
import productApi from '../../../../src/api/productApi';
import { Product } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PRODUCT_STATUS } from '../../utils/constants';

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await productApi.getAll();
      const apiData = response.data;

      const rawList = apiData.result || apiData;
      const productList = Array.isArray(rawList) ? rawList : [];

      const mappedProducts: Product[] = productList.map((p: any) => ({
        id: p.id ? p.id.toString() : p.sku,
        name: p.name || 'No Name',
        description: p.description || '',
        price: p.price || 0,
        originalPrice: p.originalPrice || p.price * 1.2,
        discount: p.discount || 0,
        
        // ✅ IMAGE SYSTEM MỚI
        images: (p.imageUrls && p.imageUrls.length > 0)
          ? p.imageUrls
          : (p.primaryImageUrl ? [p.primaryImageUrl] : ['https://via.placeholder.com/100']),
          
        category: p.categoryId ? p.categoryId.toString() : 'General',
        categoryName: p.categoryName || p.category || 'Unknown',
        
        rating: p.rating || 5,
        reviewCount: p.reviewCount || 0,
        soldCount: p.soldCount || 0,
        
        // ✅ STOCK MANAGEMENT MỚI
        stock: p.stockQuantity ?? 100,
        isAvailable: p.isAvailable ?? true,
        isLowStock: p.isLowStock ?? false,
        isOutOfStock: p.isOutOfStock ?? false,
        lowStockThreshold: p.lowStockThreshold || 5,
        
        sku: p.sku || `SKU-${p.id}`,
        status: (p.status || 'active') as any,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (
  productData: any
): Promise<number | null> => {
  try {
    const res = await productApi.create(productData);

    // TÙY CẤU TRÚC RESPONSE BACKEND
    return (
      res?.data?.id ??
      res?.data?.result?.id ??
      null
    );
  } catch (error) {
    console.error('Create product failed', error);
    return null;
  }
};

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productApi.delete(productId);
        await fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert('Failed to delete product');
      }
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Product',
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-12 h-12 object-cover rounded"
          />
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (product: Product) => (
        <span className="text-gray-900">{product.categoryName}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (product: Product) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(product.price)}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <span className={
            product.isOutOfStock 
              ? 'text-red-600 font-bold' 
              : product.isLowStock 
              ? 'text-yellow-600 font-medium' 
              : 'text-gray-900'
          }>
            {product.stock}
          </span>
          {product.isOutOfStock && (
            <Badge variant="red" size="sm">Out</Badge>
          )}
          {product.isLowStock && !product.isOutOfStock && (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      ),
    },
    {
      key: 'sold',
      label: 'Sold',
      render: (product: Product) => (
        <span className="text-gray-900">{product.soldCount}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (product: Product) => {
        const status = product.isOutOfStock 
          ? 'out_of_stock' 
          : product.isAvailable 
          ? 'active' 
          : 'inactive';
        return (
          <Badge variant={PRODUCT_STATUS[status].color as any}>
            {PRODUCT_STATUS[status].label}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (product: Product) => (
        <span className="text-sm text-gray-500">
          {formatDate(product.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduct(product.id);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  // Tính số lượng sản phẩm low stock và out of stock
  const lowStockCount = products.filter(p => p.isLowStock && !p.isOutOfStock).length;
  const outOfStockCount = products.filter(p => p.isOutOfStock).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stock Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Low Stock Alert</p>
                  <p className="text-sm text-yellow-700">
                    {lowStockCount} product(s) running low on stock
                  </p>
                </div>
              </div>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Out of Stock</p>
                  <p className="text-sm text-red-700">
                    {outOfStockCount} product(s) out of stock
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
          <Button variant="secondary">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <Card padding={false}>
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading Products...</div>
        ) : (
          <Table columns={columns} data={paginatedProducts} />
        )}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
}