import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { 
  Loader2, 
  Search, 
  LogIn, 
  LogOut, 
  Trash2, 
  Pencil, 
  CheckCircle2, 
  Settings, 
  Package, 
  FileText, 
  AlertTriangle,
  User as UserIcon,
} from "lucide-react";

// --- Action Badge Configuration ---
const getActionBadge = (action) => {
  const a = action.toUpperCase();
  
  const config = {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-300",
    icon: <AlertTriangle className="w-4 h-4" />
  };

  if (a.includes("LOGIN") || a.includes("LOGOUT")) {
    return { 
      ...config, 
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-300",
      icon: a.includes("LOGOUT") ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />
    };
  }

  if (a.includes("DELETE")) {
    return { ...config, bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-300", icon: <Trash2 className="w-4 h-4" /> };
  }

  if (a.includes("CREATE")) {
    return { ...config, bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-300", icon: <CheckCircle2 className="w-4 h-4" /> };
  }

  if (a.includes("UPDATE")) {
    return { ...config, bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-orange-600 dark:text-orange-500", icon: <Pencil className="w-4 h-4" /> };
  }

  if (a.includes("SETTINGS") || a.includes("COMPANY")) {
    return { ...config, bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-300", icon: <Settings className="w-4 h-4" /> };
  }

  if (a.includes("PRODUCT") || a.includes("CATEGORY")) {
    return { ...config, bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-300", icon: <Package className="w-4 h-4" /> };
  }

  if (a.includes("QUOTE")) {
    return { ...config, bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-300", icon: <FileText className="w-4 h-4" /> };
  }

  if (a.includes("USER") || a.includes("REGISTER")) {
    return { ...config, bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-600 dark:text-teal-300", icon: <UserIcon className="w-4 h-4" /> };
  }

  return config;
};

const ActivityLog = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  // Initial fetch (only once)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.activityLogs.getAll(token, { search: "", limit: 200 }); // Fetch all for local filtering
        if (response.success) setAllLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  // Frontend Search (Instant, no API calls!)
  const filteredLogs = useMemo(() => {
    if (!search) return allLogs;
    const s = search.toLowerCase();
    return allLogs.filter(
      (log) =>
        log.user?.toLowerCase().includes(s) ||
        log.action?.toLowerCase().includes(s) ||
        log.entity_type?.toLowerCase().includes(s) ||
        (log.reason && log.reason.toLowerCase().includes(s))
    );
  }, [allLogs, search]);

  // Helper to display user's full name
  const getUserName = (log) => {
    if (log.User) {
      return `${log.User.first_name || ""} ${log.User.last_name || ""}`.trim();
    }
    return log.user || "System";
  };

  const getUserEmail = (log) => {
    return log.User?.email || log.user_email || "No email";
  };

  const getUserRole = (log) => {
    return log.User?.role || log.details?.role || "N/A";
  };

  const getUserAvatar = (log) => {
    return log.User?.avatar_url || null;
  };

  // Helper to display details
  const getDetails = (log) => {
    if (!log.details) return null;
    
    const entries = Object.entries(log.details);
    if (entries.length === 0) return null;

    return (
      <div className={`mt-2 p-2 rounded-md text-xs ${isDark ? "bg-[#242424]" : "bg-gray-50"}`}>
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between py-0.5">
            <span className={`font-medium capitalize ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {key.replace(/_/g, " ")}:
            </span>
            <span className={`${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const cardClasses = `rounded-xl border p-5 shadow-sm ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`;
  const titleClasses = `text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`;
  const descClasses = `mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`;
  const inputClasses = `pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:border-[#E6501B] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-200 bg-white text-gray-900"}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={titleClasses}>Activity Log</h1>
          <p className={descClasses}>Audit trail of all actions taken in the system.</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, users, reasons..."
            className={inputClasses}
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C3110C]" />
        </div>
      ) : (
        <div className={cardClasses}>
          <div className="space-y-4">
            {filteredLogs.length === 0 && (
              <p className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No activity found.
              </p>
            )}

            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              
              return (
                <div
                  key={log.id}
                  className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all ${isDark ? "border-[#2A2A2A] hover:bg-[#242424]" : "border-gray-100 hover:bg-gray-50"}`}
                >
                  {/* Avatar / User Info */}
                  <div className="flex items-center gap-3 sm:w-56 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C3110C] to-[#E6501B] overflow-hidden flex-shrink-0">
                      {getUserAvatar(log) ? (
                        <img src={getUserAvatar(log)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {getUserName(log).charAt(0).toUpperCase() || "S"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                        {getUserName(log)}
                      </p>
                      <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {getUserEmail(log)}
                      </p>
                      <p className={`text-[10px] font-semibold uppercase mt-1 inline-block px-2 py-0.5 rounded-full ${isDark ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
                        {getUserRole(log)}
                      </p>
                    </div>
                  </div>

                  {/* Action & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${badge.bg} ${badge.text}`}>
                          {badge.icon}
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {log.entity_type}
                        </span>
                      </div>
                      <p className={`text-xs flex-shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Details */}
                    {getDetails(log)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;