import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const QuoteStatus = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const statusData = [
    { label: 'Pending', count: 12, color: '#F59E0B' },
    { label: 'Approved', count: 18, color: '#10B981' },
    { label: 'Rejected', count: 8, color: '#EF4444' },
    { label: 'Completed', count: 18, color: '#C3110C' },
  ];

  const total = statusData.reduce((s, d) => s + d.count, 0);
  
  let currentAngle = 0;
  const gradientParts = statusData.map((item) => {
    const percentage = (item.count / total) * 360;
    const start = currentAngle;
    const end = currentAngle + percentage;
    currentAngle = end;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return (
    <div className={`rounded-xl p-4 sm:p-6 border shadow-sm hover:border-[#C3110C] transition-all duration-300 ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm sm:text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <i className="fas fa-chart-pie text-[#C3110C] mr-2"></i> Quote Status
        </h3>
        <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'text-gray-400 bg-[#2A2A2A]' : 'text-gray-500 bg-gray-100'}`}>Overview</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <div 
          className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full shadow-md flex-shrink-0"
          style={{ background: `conic-gradient(${gradientParts.join(', ')})` }}
        ></div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 sm:flex-col sm:gap-2">
          {statusData.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-2 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{ background: item.color }}></span>
              {item.label}
              <span className={`ml-auto font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteStatus;