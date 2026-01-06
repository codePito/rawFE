import React, { useEffect, useState, useRef, Component } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const {
    searchProducts
  } = useProducts();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchProducts(query);
      setResults(searchResults.slice(0, 5));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, searchProducts]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setIsOpen(false);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };
  return <div ref={wrapperRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm sản phẩm..." className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
        {query && <button type="button" onClick={() => {
        setQuery('');
        setIsOpen(false);
      }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>}
      </form>

      {isOpen && results.length > 0 && <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.map(product => <button key={product.id} onClick={() => handleProductClick(product.id)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left">
              <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm text-primary-600 font-semibold">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </button>)}
        </div>}
    </div>;
}