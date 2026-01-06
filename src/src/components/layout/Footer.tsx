import { useEffect, useState } from 'react';
import { Facebook, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import categoryApi from '../../api/categoryApi';

interface Category {
  id: string;
  name: string;
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        const rawList = response.data.result || response.data || [];
        const mapped = rawList.slice(0, 3).map((c: any) => ({
          id: c.id?.toString(),
          name: c.name
        }));
        setCategories(mapped);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShopHub</span>
            </div>
            <p className="text-sm">
              Điểm đến mua sắm cho sản phẩm chất lượng với giá tốt nhất.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Cửa Hàng</h3>
            <ul className="space-y-2 text-sm">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.id}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Kết Nối Với Chúng Tôi</h3>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              <span>lenguyenanhtuan100103@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2026 ShopHub. All rights reserved.</p>
        </div>
      </div>
    </footer>;
}