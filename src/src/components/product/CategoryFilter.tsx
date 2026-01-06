import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import categoryApi from '../../api/categoryApi';
import { Category } from '../../types';

export function CategoryFilter() {
  const { categoryId } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        const apiData = response.data;

        // 1. Xác định vị trí mảng dữ liệu (tương tự ProductContext)
        // Kiểm tra xem data nằm trong .result (kiểu .NET response wrapper) hay trả về trực tiếp
        const rawList = apiData.result || apiData || [];

        if (Array.isArray(rawList)) {
          // 2. Map dữ liệu sang cấu trúc Frontend
          const mappedCategories = rawList.map((c: any) => ({
            id: c.id ? c.id.toString() : c.Id?.toString(),
            name: c.name || c.Name || 'Unnamed Category',
            // Nếu API không trả về icon, dùng icon mặc định
            icon: c.icon || c.Icon || '📦',
            imageUrl: c.imageUrl || c.ImageUrl || null,
          }));
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return null; // Hoặc hiển thị skeleton loader
  if (categories.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Danh mục</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
              categoryId === category.id
                ? 'bg-primary-50 border-2 border-primary-500'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            {/* Hiển thị Image nếu có, fallback về icon */}
            {category.imageUrl ? (
              <img 
                src={category.imageUrl} 
                alt={category.name}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : (
              <span className="text-2xl">{category.icon}</span>
            )}
            
            <span className="text-xs font-medium text-gray-700 text-center line-clamp-1">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}