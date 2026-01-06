import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { AddProductModal } from '../../components/modals/AddProductModal';
import { EditProductModal } from '../../components/modals/EditProductModal';
import productApi from '../../../../src/api/productApi';
import categoryApi from '../../../../src/api/categoryApi';
import { Product } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PRODUCT_STATUS } from '../../utils/constants';

export function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const itemsPerPage = 10;

    // Filter products by search and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // ═══════════════════════════════════════════════════════════════
    // FETCH PRODUCTS
    // ═══════════════════════════════════════════════════════════════
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
                images: (p.imageUrls && p.imageUrls.length > 0)
                    ? p.imageUrls
                    : (p.primaryImageUrl ? [p.primaryImageUrl] : ['/placeholder-image.svg']),
                category: p.categoryId ? p.categoryId.toString() : '',
                categoryName: p.categoryName || p.category || 'Unknown',
                rating: p.rating || 5,
                reviewCount: p.reviewCount || 0,
                soldCount: p.soldCount || 0,
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
        fetchCategories();
    }, [fetchProducts]);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            const data = response.data;
            const list = Array.isArray(data) ? data : (data.result || []);
            setCategories(list.map((c: any) => ({ id: c.id.toString(), name: c.name })));
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // ADD PRODUCT
    // ═══════════════════════════════════════════════════════════════
    const handleAddProduct = async (productData: any): Promise<number | null> => {
        try {
            const res = await productApi.create(productData);
            await fetchProducts();
            return res?.data?.id ?? res?.data?.result?.id ?? null;
        } catch (error) {
            console.error('Create product failed', error);
            return null;
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // UPDATE PRODUCT
    // ═══════════════════════════════════════════════════════════════
    const handleUpdateProduct = async (id: string, productData: any): Promise<boolean> => {
        try {
            await productApi.update(id, productData);
            await fetchProducts();
            return true;
        } catch (error: any) {
            console.error('Update product failed:', error);
            alert(error?.response?.data?.message || 'Failed to update product');
            return false;
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // DELETE PRODUCT
    // ═══════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════
    // EDIT PRODUCT
    // ═══════════════════════════════════════════════════════════════
    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    // ═══════════════════════════════════════════════════════════════
    // TABLE COLUMNS
    // ═══════════════════════════════════════════════════════════════
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
                        onError={(e) => { e.currentTarget.src = '/placeholder-image.svg'; }}
                    />
                    <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
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
                            handleEditClick(product);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit product"
                    >
                        <Edit className="w-4 h-4 text-gray-600" />
                    </button>
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

    // Stock alerts count
    const lowStockCount = products.filter(p => p.isLowStock && !p.isOutOfStock).length;
    const outOfStockCount = products.filter(p => p.isOutOfStock).length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product inventory ({products.length} products)</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchProducts}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Product
                    </Button>
                </div>
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
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            />
                        </div>
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={e => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white min-w-[180px]"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
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

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
                onUpdate={handleUpdateProduct}
            />
        </div>
    );
}

export default ProductsPage;
