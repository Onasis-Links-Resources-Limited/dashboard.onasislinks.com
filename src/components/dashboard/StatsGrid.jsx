import { useTheme } from "../../context/ThemeContext";
import CountUpModule from "react-countup";

const CountUp = CountUpModule.default || CountUpModule;
import { Box, FileText, Users, Star } from "lucide-react";

// Calculate percentage change
const calculateChange = (current, previous) => {
  current = Number(current) || 0;
  previous = Number(previous) || 0;

  if (current === 0 && previous === 0) return { value: 0, formatted: "0%", direction: "neutral" };
  if (previous === 0) return { value: 100, formatted: "+100%", direction: "up" };

  const change = ((current - previous) / previous) * 100;
  return {
    value: change,
    formatted: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
};

const StatsCard = ({ label, value, previousValue, icon: Icon, color }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colorMap = {
    blue: isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600",
    purple: isDark ? "bg-purple-900/20 text-purple-400" : "bg-purple-50 text-purple-600",
    green: isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600",
    orange: isDark ? "bg-orange-900/20 text-orange-400" : "bg-orange-50 text-orange-600",
    red: isDark ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600",
  };

  const isPercent = typeof value === "string" && value.includes("%");
  const numericValue = parseInt(value, 10) || 0;
  const change = calculateChange(numericValue, previousValue);

  const isUp = change.direction === "up";
  const isDown = change.direction === "down";

  return (
    <div className={`rounded-xl p-4 sm:p-5 border shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#C3110C] transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-500"}`}>{label}</span>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {Icon && <Icon size={20} strokeWidth={2} />}
        </span>
      </div>

      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
        {isPercent ? (
          <><CountUp end={numericValue} duration={2} />%</>
        ) : (
          <CountUp end={numericValue} duration={2} separator="," />
        )}
      </p>

      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-2 
        ${isUp ? (isDark ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600") : 
          isDown ? (isDark ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600") : 
          (isDark ? "bg-gray-900/20 text-gray-400" : "bg-gray-100 text-gray-500")}`}>
        <span className="text-[10px]">{isUp ? "↑" : isDown ? "↓" : "→"}</span>
        {change.formatted}
      </span>
    </div>
  );
};

const StatsGrid = ({ stats = {} }) => {
  const statItems = [
    { label: "Products", value: stats.total_products || 0, previousValue: stats.previous_products || 0, icon: Box, color: "blue" },
    { label: "Quotes", value: stats.total_quotes || 0, previousValue: stats.previous_quotes || 0, icon: FileText, color: "purple" },
    { label: "Customers", value: stats.total_customers || 0, previousValue: stats.previous_customers || 0, icon: Users, color: "red" },
    { label: "Satisfaction", value: `${stats.satisfaction || 0}%`, previousValue: stats.previous_satisfaction || 0, icon: Star, color: "orange" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6">
      {statItems.map((stat) => <StatsCard key={stat.label} {...stat} />)}
    </div>
  );
};

export default StatsGrid;