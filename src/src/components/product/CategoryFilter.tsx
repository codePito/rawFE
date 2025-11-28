import React from 'react';
import { Link, useParams } from 'react-router-dom';
export function CategoryFilter() {
  const {
    categoryId
  } = useParams();
  return <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {/* {categories.map(category => <Link key={category.id} to={`/category/${category.id}`} className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${categoryId === category.id ? 'bg-orange-50 border-2 border-orange-500' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}`}> */}
            {/* <span className="text-3xl">{category.icon}</span> */}
            <span className="text-xs font-medium text-gray-700 text-center">
              {/* {category.name} */}
            </span>
          {/* </Link>)} */}
      </div>
    </div>;
}