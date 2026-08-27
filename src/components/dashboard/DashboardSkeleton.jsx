import { useTheme } from '../../context/ThemeContext';

const DashboardSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200';
  const pulse = `animate-pulse ${bg}`;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header Skeleton */}
      <div className="mb-6 space-y-2">
        <div className={`h-8 w-64 rounded-lg ${pulse}`}></div>
        <div className={`h-4 w-48 rounded-lg ${pulse}`}></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-xl p-4 sm:p-5 border ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`h-4 w-16 rounded ${pulse}`}></div>
              <div className={`w-10 h-10 rounded-xl ${pulse}`}></div>
            </div>
            <div className={`h-8 w-20 rounded mb-1 ${pulse}`}></div>
            <div className={`h-4 w-12 rounded ${pulse}`}></div>
          </div>
        ))}
      </div>

      {/* Top Products & Quote Status Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <div className={`lg:col-span-2 rounded-xl p-4 sm:p-6 border ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
          <div className={`h-5 w-40 rounded mb-4 ${pulse}`}></div>
          <div className={`h-44 sm:h-52 w-full rounded ${pulse}`}></div>
        </div>
        <div className={`rounded-xl p-4 sm:p-6 border ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
          <div className={`h-5 w-40 rounded mb-4 ${pulse}`}></div>
          <div className={`h-44 sm:h-52 w-full rounded ${pulse}`}></div>
        </div>
      </div>

      {/* Recent Quotes Skeleton */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
        <div className={`px-4 sm:px-5 py-3 sm:py-4 border-b ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
          <div className={`h-5 w-40 rounded ${pulse}`}></div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className={`h-4 w-16 rounded ${pulse}`}></div>
              <div className={`h-4 w-32 rounded ${pulse}`}></div>
              <div className={`h-4 w-24 rounded ${pulse}`}></div>
              <div className={`h-4 w-20 rounded ${pulse}`}></div>
              <div className={`h-4 w-20 rounded ${pulse}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;