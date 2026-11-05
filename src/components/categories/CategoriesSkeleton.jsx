import { useTheme } from "../../context/ThemeContext";

const CategoriesSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#2A2A2A]" : "bg-gray-200";
  const pulse = `animate-pulse ${bg}`;

  return (
    <div className={`relative z-10 min-h-screen p-6`}>
      <div className="mb-6">
        <div className={`h-8 w-40 rounded-lg mb-2 ${pulse}`}></div>
        <div className={`h-4 w-64 rounded-lg ${pulse}`}></div>
      </div>

      <div className={`mb-6 rounded-xl border p-4 ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}>
        <div className={`h-10 w-full rounded-lg ${pulse}`}></div>
      </div>

      <div className={`overflow-hidden rounded-xl border ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}>
        <div className={`p-4 border-b ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}>
          <div className={`h-4 w-24 rounded ${pulse}`}></div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`p-4 border-b ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}>
            <div className="flex gap-4 items-center">
              <div className={`w-10 h-10 rounded-lg ${pulse}`}></div>
              <div className={`h-4 w-48 rounded ${pulse}`}></div>
              <div className={`h-4 w-12 rounded ml-auto ${pulse}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSkeleton;