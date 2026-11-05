import { useMemo, useState } from "react";
import { Check, Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";

const TABS = [
  { key: "all",      label: "All" },
  { key: "unread",   label: "Unread" },
  { key: "quote",    label: "Quotes" },
  { key: "proforma", label: "Proformas" },
  { key: "po",       label: "POs" },
];

const SEVERITY_DOT = {
  info:    "bg-[#C3110C]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error:   "bg-red-500",
};

/** Which tab does this notification belong to? */
const bucketOf = (n) => {
  const t = n.type || "";
  if (t.startsWith("quote.")) return "quote";
  if (t.startsWith("proforma.")) return "proforma";
  if (t.startsWith("po.")) return "po";
  return "all";
};

/** Group by calendar day for the section headers */
const groupByDay = (items) => {
  const groups = { Today: [], Yesterday: [], "This week": [], Earlier: [] };
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday); startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfWeek.getDate() - 7);

  for (const n of items) {
    const d = new Date(n.created_at);
    if (d >= startOfToday) groups.Today.push(n);
    else if (d >= startOfYesterday) groups.Yesterday.push(n);
    else if (d >= startOfWeek) groups["This week"].push(n);
    else groups.Earlier.push(n);
  }
  return groups;
};

const relativeTime = (iso) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const Notifications = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { items, unread, markRead, markAllRead, loading } = useNotifications();
  const [tab, setTab] = useState("all");
  const [visible, setVisible] = useState(30);

  const filtered = useMemo(() => {
    let list = items;
    if (tab === "unread") list = list.filter((n) => !n.read_at);
    else if (tab !== "all") list = list.filter((n) => bucketOf(n) === tab);
    return list;
  }, [items, tab]);

  const shown = filtered.slice(0, visible);
  const groups = groupByDay(shown);
  const hasMore = filtered.length > visible;

  const unreadForTab = (key) =>
    key === "unread"
      ? unread
      : items.filter((n) => !n.read_at && (key === "all" || bucketOf(n) === key)).length;

  // ---------- styles ----------
  const card = `rounded-xl border shadow-sm ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`;
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-6 w-full">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            Notifications
          </h1>
          <p className={`text-sm mt-0.5 ${mutedText}`}>
            Stay on top of everything happening in your workspace.
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121] transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className={`flex items-center gap-1 p-1 rounded-lg overflow-x-auto w-fit ml-auto ${isDark ? "bg-[#1A1A1A]" : "bg-gray-100"}`}>
        {TABS.map(({ key, label }) => {
          const count = unreadForTab(key);
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => { setTab(key); setVisible(30); }}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? (isDark ? "bg-[#2A2A2A] text-white" : "bg-white text-gray-900 shadow-sm")
                  : (isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? "bg-[#C3110C] text-white" : (isDark ? "bg-[#2A2A2A] text-gray-300" : "bg-gray-200 text-gray-600")
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className={card}>
        {loading && shown.length === 0 ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className={`w-2 h-2 rounded-full mt-2 ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-48 rounded ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
                  <div className={`h-3 w-72 rounded ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState tab={tab} isDark={isDark} />
        ) : (
          Object.entries(groups).map(([label, list]) =>
            list.length === 0 ? null : (
              <div key={label}>
                <div className={`px-5 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-wider ${mutedText}`}>
                  {label}
                </div>
                <div>
                  {list.map((n) => (
                    <Row key={n.id} n={n} isDark={isDark} onMarkRead={() => markRead(n.id)} />
                  ))}
                </div>
              </div>
            )
          )
        )}

        {hasMore && (
          <div className={`p-4 border-t ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}>
            <button
              onClick={() => setVisible((v) => v + 30)}
              className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark ? "text-gray-300 hover:bg-[#2A2A2A]" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Row ---------- */
const Row = ({ n, isDark, onMarkRead }) => {
  const inner = (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[n.severity] || SEVERITY_DOT.info}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${isDark ? "text-gray-200" : "text-gray-800"} ${!n.read_at ? "font-medium" : ""}`}>
          {n.title}
        </p>
        {n.message && (
          <p className={`text-xs mt-0.5 truncate ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {n.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[11px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>
          {relativeTime(n.created_at)}
        </span>
        {!n.read_at && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMarkRead(); }}
            className={`text-[11px] opacity-0 group-hover:opacity-100 transition-opacity ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );

  const base = `group flex items-start px-5 py-3.5 border-b last:border-b-0 cursor-pointer transition-colors ${
    isDark ? "border-[#2A2A2A] hover:bg-[#2A2A2A]" : "border-gray-100 hover:bg-gray-50"
  } ${!n.read_at ? (isDark ? "bg-[#C3110C]/5" : "bg-[#C3110C]/5") : ""}`;

  return n.link ? (
    <Link to={n.link} className={base} onClick={onMarkRead}>{inner}</Link>
  ) : (
    <div className={base} onClick={onMarkRead}>{inner}</div>
  );
};

/* ---------- Empty ---------- */
const EmptyState = ({ tab, isDark }) => {
  const copy = {
    all:      { title: "You're all caught up",    sub: "New activity will appear here as it happens." },
    unread:   { title: "No unread notifications", sub: "Nothing needs your attention right now." },
    quote:    { title: "No quote notifications",  sub: "New quote requests and status changes will show up here." },
    proforma: { title: "No proforma notifications", sub: "Sent and failed proforma emails will appear here." },
    po:       { title: "No PO notifications",     sub: "Recorded purchase orders will appear here." },
  }[tab];

  return (
    <div className="p-12 text-center">
      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${isDark ? "bg-[#2A2A2A]" : "bg-gray-100"}`}>
        <Bell className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
      </div>
      <p className={`mt-3 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {copy.title}
      </p>
      <p className={`mt-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {copy.sub}
      </p>
    </div>
  );
};

export default Notifications;