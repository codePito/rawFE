import React from 'react';
import { SortOption } from '../../types';
interface SortFilterProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}
export function SortFilter({
  value,
  onChange
}: SortFilterProps) {
  const options: {
    value: SortOption;
    label: string;
  }[] = [{
    value: 'popular',
    label: 'Phổ biến nhất'
  }, {
    value: 'price-asc',
    label: 'Giá: Thấp đến Cao'
  }, {
    value: 'price-desc',
    label: 'Giá: Cao đến Thấp'
  }, {
    value: 'rating',
    label: 'Đánh giá cao nhất'
  }];
  return <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sắp xếp:</span>
      <select value={value} onChange={e => onChange(e.target.value as SortOption)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm">
        {options.map(option => <option key={option.value} value={option.value}>
            {option.label}
          </option>)}
      </select>
    </div>;
}