import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState("week"); // 'week' | 'month'
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/api/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-700">Loading Dashboard Analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Currency Formatter
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  // Time Formatter
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Active Chart Data filter setup
  const rawChartData = data.sales_chart || [];
  const displayedChartData =
    chartRange === "week" ? rawChartData.slice(-7) : rawChartData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation & Profile Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Dashboard Overview
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Live System
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Real-time store performance, inventory updates, and live orders.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search analytics or orders..."
                className="w-full bg-slate-50 text-xs sm:text-sm text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Notifications Button */}
            <button 
              onClick={() => navigate('/admin/inventory')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition flex-shrink-0 relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {data.low_stock > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm text-sm">
                A
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-slate-900 leading-tight">Admin User</p>
                <p className="text-slate-500">General Manager</p>
              </div>
              <button 
                className="text-slate-400 hover:text-rose-600 transition ml-1 p-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Top Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Today's Sales"
            value={formatCurrency(data.today_sales)}
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            badge="+12%"
            badgePositive={true}
            gradient="from-emerald-500/10 to-transparent"
          />
          <StatCard
            title="Order Count"
            value={`${data.order_count || 0} orders`}
            icon={<ShoppingBag className="w-5 h-5 text-indigo-600" />}
            gradient="from-indigo-500/10 to-transparent"
          />
          <StatCard
            title="Active Tables"
            value={`${data.tables?.active || 0} / ${data.tables?.total || 0}`}
            icon={<UtensilsCrossed className="w-5 h-5 text-blue-600" />}
            progress={((data.tables?.active || 0) / (data.tables?.total || 1)) * 100}
            gradient="from-blue-500/10 to-transparent"
          />
          <StatCard
            title="Top Selling Item"
            value={data.top_item?.name || "N/A"}
            subtitle={`${data.top_item?.sold_quantity || 0} sold today`}
            icon={<Award className="w-5 h-5 text-amber-500" />}
            gradient="from-amber-500/10 to-transparent"
          />
          <StatCard
            title="Low Stock Alerts"
            value={`${data.low_stock || 0} items`}
            icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
            isAlert={(data.low_stock || 0) > 0}
            gradient="from-rose-500/10 to-transparent"
          />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart Container */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Sales Trend Analytics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revenue performance overview across days
                </p>
              </div>

              {/* Chart Timeframe Controls */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                <button
                  onClick={() => setChartRange("week")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    chartRange === "week"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setChartRange("month")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    chartRange === "month"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Recharts Render */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayedChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="sale_date"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "0.75rem",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      color: "#0F172A",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                    formatter={(val) => [`$${val}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Feed Container */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                  <p className="text-xs text-slate-500">Live inventory and stock updates</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {data.recent_activity && data.recent_activity.length > 0 ? (
                  data.recent_activity.map((act) => {
                    const isAddition = act.change_type === "addition";
                    return (
                      <div
                        key={act.id}
                        className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 transition"
                      >
                        <div
                          className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                            isAddition
                              ? "bg-emerald-100/70 text-emerald-700"
                              : "bg-rose-100/70 text-rose-700"
                          }`}
                        >
                          {isAddition ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {act.menu_item?.name || "Inventory Adjustment"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {act.reason || (isAddition ? "Restocked" : "Stock consumed")}{" "}
                            •{" "}
                            <span
                              className={
                                isAddition
                                  ? "text-emerald-600 font-bold"
                                  : "text-rose-600 font-bold"
                              }
                            >
                              {isAddition ? "+" : "-"}
                              {act.quantity_change} units
                            </span>
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(act.created_at)}</span>
                            <span>•</span>
                            <span>By {act.user?.name || "System"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No recent activities recorded.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/inventory")}
              className="mt-4 w-full py-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>View Inventory Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Section: Operations & Promo Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kitchen Performance Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kitchen Performance
              </h3>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Optimal Speed
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">Average Preparation Time</span>
                  <span className="font-bold text-slate-900">14m 22s</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[65%] rounded-full transition-all duration-500"></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Orders Currently Pending</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs">
                  12 Active
                </span>
              </div>
            </div>
          </div>

          {/* Active Promotion Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex-1 z-10">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Promotion Campaign
              </span>
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                "Summer Cooler" promo active
              </h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Generating high sales traction with a +15% boost today.
              </p>
              <button
                onClick={() => navigate("/admin/discount")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
              >
                <span>Manage Promos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Illustration Badge */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-200/60 hidden sm:flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              🍹
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* Helper Component for Metric KPI Cards */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgePositive,
  progress,
  isAlert,
  gradient,
}) {
  return (
    <div
      className={`bg-white border ${
        isAlert
          ? "border-rose-300 ring-2 ring-rose-100"
          : "border-slate-200/80"
      } rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden transition hover:shadow-md`}
    >
      {/* Background Gradient Subtle Accent */}
      {gradient && (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`}
        />
      )}

      <div className="flex justify-between items-start z-10">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-100/80 backdrop-blur-sm">
          {icon}
        </div>
      </div>

      <div className="mt-4 z-10">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            {value}
          </h3>
          {badge && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                badgePositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 font-medium mt-1 truncate">
            {subtitle}
          </p>
        )}

        {typeof progress === "number" && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}