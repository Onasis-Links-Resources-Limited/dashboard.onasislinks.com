import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const TopProducts = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const products = [
    { name: 'Fiber Optic', count: 45 },
    { name: '5G Antenna', count: 32 },
    { name: 'Cloud Server', count: 28 },
    { name: 'Router Pro', count: 22 },
    { name: 'Switch X', count: 18 },
  ];

  const maxCount = Math.max(...products.map(p => p.count));

  return (
    <div className={`lg:col-span-2 rounded-xl p-4 sm:p-6 border shadow-sm hover:border-[#C3110C] transition-all duration-300 ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm sm:text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <i className="fas fa-chart-bar text-[#C3110C] mr-2"></i> Top Products
        </h3>
        <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'text-gray-400 bg-[#2A2A2A]' : 'text-gray-500 bg-gray-100'}`}>This month</span>
      </div>
      <div className="flex items-end justify-between h-36 sm:h-40 gap-1 sm:gap-2 pt-2">
        {products.map((product, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full max-w-[32px] sm:max-w-[40px] rounded-t-md transition-all duration-700 hover:opacity-80"
              style={{ 
                height: `${(product.count / maxCount) * 110}px`,
                background: 'linear-gradient(180deg, #C3110C, #E6501B)'
              }}
            ></div>
            <span className={`text-[10px] sm:text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{product.count}</span>
            <span className={`text-[8px] sm:text-[10px] font-medium text-center truncate w-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {product.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;