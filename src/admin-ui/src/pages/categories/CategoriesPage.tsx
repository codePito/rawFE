import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { AddCategoryModal } from '../../components/modals/AddCategoryModal';
import { EditCategoryModal } from '../../components/modals/EditCategoryModal';
import categoryApi from '../../../../src/api/categoryApi';
import { Category } from '../../types';
import { formatDate } from '../../utils/formatters';

export function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 10;

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await categoryApi.getAll();
            const rawList = response.data.result || response.data || [];
            const mappedCategories: Category[] = rawList.map((c: any) => ({
                id: c.id?.toString() || c.name,
                name: c.name || 'Unnamed',
                slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
                icon: c.icon || '📦',
                imageUrl: c.imageUrl || null,
                productCount: c.productCount || c.products?.length || 0,
                status: (c.status || 'active') as any,
                createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            }));
            setCategories(mappedCategories);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleAddCategory = async (name: string) => {
        try {
            await categoryApi.create({ name });
            await fetchCategories();
            return true;
        } catch { return false; }
    };

    const handleUpdateCategory = async (id: string, data: any): Promise<boolean> => {
        try {
            // Ensure id in body matches URL id
            const payload = {
                ...data,
                id: Number(id) // Make sure id is number and matches
            };
            
            await categoryApi.update(id, payload);
            await fetchCategories();
            return true;
        } catch (e: any) {
            console.error('Error response:', e?.response?.data);
            alert(e?.response?.data?.message || e?.response?.data?.title || 'Update failed');
            return false;
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await categoryApi.delete(id);
            await fetchCategories();
        } catch { alert('Delete failed'); }
    };

    const handleEditClick = (cat: Category) => {
        setSelectedCategory(cat);
        setIsEditModalOpen(true);
    };

    const columns = [
        {
            key: 'icon', label: 'Category',
            render: (c: Category) => (
                <div className="flex items-center gap-3">
                    {c.imageUrl ? (
                        <img 
                            src={c.imageUrl} 
                            alt={c.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=No+Image';
                            }}
                        />
                    ) : (
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-2xl">{c.icon}</div>
                    )}
                    <div><p className="font-medium text-gray-900">{c.name}</p><p className="text-sm text-gray-500">ID: {c.id}</p></div>
                </div>
            ),
        },
        { key: 'slug', label: 'Slug', render: (c: Category) => <span className="text-gray-600 font-mono text-sm">{c.slug}</span> },
        { key: 'productCount', label: 'Products', render: (c: Category) => <span className="font-semibold">{c.productCount}</span> },
        { key: 'status', label: 'Status', render: (c: Category) => <Badge variant={c.status === 'active' ? 'green' : 'gray'}>{c.status}</Badge> },
        { key: 'createdAt', label: 'Created', render: (c: Category) => <span className="text-sm text-gray-500">{formatDate(c.createdAt)}</span> },
        {
            key: 'actions', label: 'Actions',
            render: (c: Category) => (
                <div className="flex gap-2">
                    <button onClick={() => handleEditClick(c)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4 text-gray-600" /></button>
                    <button onClick={() => handleDeleteCategory(c.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-gray-900">Categories</h1><p className="text-gray-600 mt-1">Manage categories ({categories.length})</p></div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchCategories}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
                    <Button variant="primary" onClick={() => setIsAddModalOpen(true)}><Plus className="w-5 h-5 mr-2" />Add Category</Button>
                </div>
            </div>
            <Card><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" /></div></Card>
            <Card padding={false}>{isLoading ? <div className="p-6 text-center">Loading...</div> : <Table columns={columns} data={paginatedCategories} />}<div className="px-6 py-4 border-t"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div></Card>
            <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCategory} />
            <EditCategoryModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedCategory(null); }} category={selectedCategory} onUpdate={handleUpdateCategory} />
        </div>
    );
}

export default CategoriesPage;
