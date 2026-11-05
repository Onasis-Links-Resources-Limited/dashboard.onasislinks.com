import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Home, ArrowLeft, Shield, Lock } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-[80vh] flex items-center justify-center px-4 ${
      isDark ? "text-white" : "text-[#280905]"
    }`}>
      <div className="text-center max-w-lg">
        {/* Shield Icon with Glow */}
        <div className="relative mb-8">
          <div className="text-8xl sm:text-9xl font-extrabold tracking-tight text-red-500/20 select-none">
            403
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-2xl animate-pulse" />
              <Shield className="w-20 h-20 text-red-500 dark:text-red-400 relative z-10" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 flex items-center justify-center gap-2">
          <Lock className="w-6 h-6 text-red-500" />
          Access Denied
        </h1>

        {/* Description */}
        <p className={`text-base sm:text-lg mb-8 ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}>
          You don't have permission to access this page. 
          Please contact your administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
              isDark
                ? "bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white border border-[#3A3A3A]"
                : "bg-gray-100 hover:bg-gray-200 text-[#280905] border border-gray-200"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 bg-[#C3110C] hover:bg-[#E6501B] text-white shadow-lg shadow-[#C3110C]/25 dark:shadow-[#E6501B]/20"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-[#2A2A2A]">
          <p className={`text-sm ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}>
            Need access? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;