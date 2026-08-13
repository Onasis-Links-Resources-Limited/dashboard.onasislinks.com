import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const StatsCard = ({ label, value, change, icon, color }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colorMap = {
    blue: `bg-blue-50 text-blue-600 ${isDark ? 'dark:bg-blue-900/20 dark:text-blue-400' : ''}`,
    purple: `bg-purple-50 text-purple-600 ${isDark ? 'dark:bg-purple-900/20 dark:text-purple-400' : ''}`,
    green: `bg-green-50 text-green-600 ${isDark ? 'dark:bg-green-900/20 dark:text-green-400' : ''}`,
    orange: `bg-orange-50 text-orange-600 ${isDark ? 'dark:bg-orange-900/20 dark:text-orange-400' : ''}`,
  };

  return (
    <div className={`rounded-xl p-4 sm:p-5 border shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#C3110C] transition-all duration-300 ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-base sm:text-lg ${colorMap[color]}`}>
  {icon}  {/* ✅ Renders the React element directly */}
</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold text-green-600 px-2 py-0.5 rounded-full mt-2 ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50'}`}>
        <i className="fas fa-arrow-up text-[10px]"></i> {change}
      </span>
    </div>
  );
};

export default StatsCard;