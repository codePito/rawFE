import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { AddProductModal } from '../../components/modals/AddProductModal';
import productApi from '../../../../src/api/productApi'
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
  // Filter products based on search
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await productApi.getAll();
      const apiData = response.data;

      // === FIX LỖI ÁNH XẠ: Xử lý response.data là mảng hoặc nằm trong .result ===
      const rawList = apiData.result || apiData;
      const productList = Array.isArray(rawList) ? rawList : [];

      const mappedProducts: Product[] = productList.map((p: any) => ({
        id: p.id ? p.id.toString() : p.sku,
        name: p.name || 'No Name',
        description: p.description || '',
        price: p.price || 0,
        originalPrice: p.originalPrice || p.price * 1.2, 
        discount: p.discount || 0,
        
        // FIX: Xử lý mảng ảnh (kiểm tra các thuộc tính phổ biến của ảnh)
        images: (p.images && p.images.length > 0)
          ? p.images.map((img: any) => img.filePath || img.FilePath || img.url || 'https://via.placeholder.com/100')
          : ['https://via.placeholder.com/100'],
          
        category: p.categoryId ? p.categoryId.toString() : 'General',
        categoryName: p.categoryName || p.category || 'Unknown', // Đảm bảo luôn có CategoryName
        
        rating: p.rating || 5, 
        reviewCount: p.reviewCount || 0, 
        soldCount: p.soldCount || 0, 
        stock: p.stock || 100, // Đảm bảo giá trị mặc định 
        sku: p.sku || `SKU-${p.id}`,
        status: (p.status || 'active') as any,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      }));
      setProducts(mappedProducts);
    } catch(error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (productData: any) : Promise<boolean> => {
    try {
      await productApi.create(productData);
      await fetchProducts();
      alert('Product added successfully!');
      return true;
    } catch(error) {
      console.error("Failed to add product:", error);
      alert('Failed to add product');
      return false;
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure want to delete this product?')) {
      try {
        await productApi.delete(productId);
        await fetchProducts();
        alert('Product deleted successfully!');
      } catch(error) {
        console.error("Failed to deleted product:", error)
        alert('Failed to delete product')
      }
    }
  };
  
  const columns = [{
    key: 'image',
    label: 'Product',
    render: (product: Product) => <div className="flex items-center gap-3">
          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">{product.sku}</p>
          </div>
        </div>
  }, {
    key: 'category',
    label: 'Category',
    render: (product: Product) => <span className="text-gray-900">{product.categoryName}</span>
  }, {
    key: 'price',
    label: 'Price',
    render: (product: Product) => <span className="font-semibold text-gray-900">
          {formatCurrency(product.price)}
        </span>
  }, {
    key: 'stock',
    label: 'Stock',
    render: (product: Product) => <span className={product.stock < 10 ? 'text-red-600 font-medium' : 'text-gray-900'}>
          {product.stock}
        </span>
  }, {
    key: 'sold',
    label: 'Sold',
    render: (product: Product) => <span className="text-gray-900">{product.soldCount}</span>
  }, {
    key: 'status',
    label: 'Status',
    render: (product: Product) => <Badge variant={PRODUCT_STATUS[product.status].color as any}>
          {PRODUCT_STATUS[product.status].label}
        </Badge>
  }, {
    key: 'createdAt',
    label: 'Created',
    render: (product: Product) => <span className="text-sm text-gray-500">
          {formatDate(product.createdAt)}
        </span>
  }, 
{
      key: 'actions',
      label: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          {/* ... nút Edit (nếu có) ... */}
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
    },];
  return <div className="space-y-6">
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

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
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
          <div className="p-6 text-center text-gray-500"> Loading Product... </div>
        ) : (
          <Table columns={columns} data={paginatedProducts} />
        )}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </Card>

      {/* Add Product Modal */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} />
    </div>;
}