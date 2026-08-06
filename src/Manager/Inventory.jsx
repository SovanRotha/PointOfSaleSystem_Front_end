import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ClipboardList,
  AlertTriangle,
  Bell,
  Truck,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  User,
  RotateCcw,
  Plus,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";

export default function Inventory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/stock_logs");
      const payload = response?.data;

      const rawLogs = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.stock_log)
          ? payload.stock_log
          : Array.isArray(payload?.stock_log?.data)
            ? payload.stock_log.data
            : [];

      setLogs(rawLogs);

      if (payload?.stock_log) {
        setPagination({
          current_page: payload.stock_log.current_page,
          last_page: payload.stock_log.last_page,
          total: payload.stock_log.total,
          per_page: payload.stock_log.per_page,
        });
      }
    } catch (err) {
      console.error("Failed to fetch inventory logs", err);
      setError("Unable to load inventory records at this moment.");
    } finally {
      setLoading(false);
    }
  };

  // Safe image helper
  const getItemImage = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:8000/storage/${imagePath}`;
  };

  // Helper to extract initials for placeholder avatars
  const getInitials = (name) => {
    if (!name) return "IT";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Calculate high-level summary metrics dynamically from incoming logs
  const metrics = React.useMemo(() => {
    const totalItems = logs.length;
    const outOfStockCount = logs.filter(
      (log) => Number(log.menu_item?.stock_quantity || log.new_stock) === 0,
    ).length;
    const lowStockCount = logs.filter((log) => {
      const current = Number(log.menu_item?.stock_quantity || log.new_stock);
      const threshold = Number(log.menu_item?.low_stock_threshold || 0);
      return current > 0 && current <= threshold;
    }).length;

    return {
      total: totalItems,
      outOfStock: outOfStockCount,
      lowStock: lowStockCount,
      activeOrders: "Important Data",
    };
  }, [logs]);

  // Filter items based on Search & Stock state
  const filteredLogs = logs.filter((log) => {
    const item = log.menu_item || {};
    const itemName = item.name || "Unknown item";
    const sku = item.sku || "";

    const matchesSearch =
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStock = Number(item.stock_quantity ?? log.new_stock);
    const threshold = Number(item.low_stock_threshold ?? 0);
    const isLowOrOut = currentStock <= threshold;

    if (showLowStockOnly) {
      return matchesSearch && isLowOrOut;
    }

    return matchesSearch;
  });

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this stock log?");

    if (!confirmed) return;

    try {
        await api.delete(`/api/stock_logs/${id}`);

        // Remove deleted item from state
        setLogs((prev) =>
            prev.filter((log) => log.id !== id)
        );

        alert("Stock log deleted successfully!");

    } catch (error) {
        console.error("Failed to delete", error);
    }
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#002B7F] tracking-tight">
              Inventory & Stock
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Main Warehouse / Kitchen Supply
            </p>
          </div>

          {/* Quick Actions / Controls */}
          <div className="flex flex-wrap items-center gap-3">
            

            <button
              onClick={() => navigate("/manager/addinventory")}
              className="flex items-center justify-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Inventory</span>
            </button>
            {/* Low Stock Toggle Switch */}
            <label className="inline-flex items-center gap-3 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-all select-none">
              <span className="text-sm font-semibold text-slate-600">
                Show only Low/Out of Stock
              </span>
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#002B7F]"></div>
            </label>

            <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002B7F] flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-400 block">
                Total Logs Recorded
              </span>
              <span className="text-2xl font-extrabold text-slate-800">
                {metrics.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 2: Out of Stock */}
          <div className="bg-white border-2 border-red-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-red-600 block">
                Out of Stock
              </span>
              <span className="text-lg font-extrabold text-red-700">
                {metrics.outOfStock.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Card 3: Low Stock Alert */}
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-amber-600 block">
                Low Stock Alert
              </span>
              <span className="text-lg font-extrabold text-amber-700">
                {metrics.lowStock.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Card 4: Active Orders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between overflow-hidden">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-slate-400 block">
                Active Deliveries
              </span>
              <span className="text-lg font-extrabold text-slate-800">
                {metrics.activeOrders}
              </span>
            </div>
            <Truck className="w-10 h-10 text-slate-200 stroke-[1.2]" />
          </div>
        </div>

        {/* Main Table Wrapper */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Internal Table Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory items or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
              />
            </div>

            <div className="text-sm text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredLogs.length}
              </span>{" "}
              of <span className="font-bold text-slate-800">{logs.length}</span>{" "}
              entries
            </div>
          </div>

          {/* Data State Handlers */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#002B7F] animate-spin" />
              <p className="text-sm font-semibold text-slate-500">
                Fetching stock log records...
              </p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">{error}</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-600">
                No matching inventory items found.
              </p>
              <p className="text-xs text-slate-400">
                Try adjusting your search criteria or clear active filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-5">Item Name</th>
                    <th className="py-3.5 px-4">Change Log</th>
                    <th className="py-3.5 px-4">Current Stock</th>
                    <th className="py-3.5 px-4">Threshold</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const item = log.menu_item || {};
                    const itemName = item.name ?? "Unknown item";
                    const sku =
                      item.sku || log.id ? `SKU-${item.id || log.id}` : "N/A";
                    const currentStock = Number(
                      item.stock_quantity ?? log.new_stock ?? 0,
                    );
                    const threshold = Number(item.low_stock_threshold ?? 0);
                    const imageSrc = getItemImage(item.image);
                    const initials = getInitials(itemName);

                    // Compute Badge Status
                    let statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        In Stock
                      </span>
                    );

                    if (currentStock === 0) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Out of Stock
                        </span>
                      );
                    } else if (currentStock <= threshold) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Low Stock
                        </span>
                      );
                    }

                    // Format Change Type Pill
                    const isAddition = log.change_type === "addition";

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* ITEM NAME & SKU */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 text-[#002B7F] font-extrabold text-xs">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={itemName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-[#002B7F] transition-colors">
                                {itemName}
                              </h3>
                              <p className="text-[10px] font-mono text-slate-400 uppercase">
                                {sku}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CHANGE LOG */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 font-bold">
                              {isAddition ? (
                                <span className="text-emerald-600 flex items-center gap-0.5">
                                  <ArrowUpRight className="w-3.5 h-3.5" />+
                                  {log.quantity_change}
                                </span>
                              ) : (
                                <span className="text-red-500 flex items-center gap-0.5">
                                  <ArrowDownRight className="w-3.5 h-3.5" />-
                                  {Math.abs(log.quantity_change)}
                                </span>
                              )}
                              <span className="text-xs text-slate-400 font-normal">
                                ({log.previous_stock} &rarr; {log.new_stock})
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                              {log.reason || log.notes || "Manual stock update"}
                            </p>
                          </div>
                        </td>

                        {/* CURRENT STOCK */}
                        <td className="py-4 px-4 font-extrabold text-slate-700 text-sm">
                          {currentStock === 0 ? (
                            <span className="text-red-600">0 Units</span>
                          ) : (
                            <span>{currentStock} Units</span>
                          )}
                        </td>

                        {/* THRESHOLD */}
                        <td className="py-4 px-4 font-semibold text-slate-500">
                          {threshold} Units
                        </td>

                        {/* STATUS BADGE */}
                        <td className="py-4 px-4">{statusBadge}</td>

                        {/* LAST RESTOCK / DATE & USER */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-700 block">
                              {new Date(log.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-300" />
                              {log.user?.name ?? "System"}
                            </span>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-4 px-5 text-right space-x-2">
                          <button 
                          onClick = {() => navigate(`/manager/editinventory/${log.id}`)}
                          className="px-3 py-1.5 bg-[#002B7F] hover:bg-blue-900 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all inline-flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* <button 
                          onClick = {() => handleDelete(log.id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[11px] transition-all inline-flex items-center gap-1">
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span>Delete</span>
                          </button> */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm">
            <span className="text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredLogs.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {pagination?.total || logs.length}
              </span>{" "}
              items
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination?.current_page === 1 || !pagination}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-700 px-2">
                Page {pagination?.current_page || 1} of{" "}
                {pagination?.last_page || 1}
              </span>
              <button
                disabled={
                  pagination?.current_page === pagination?.last_page ||
                  !pagination
                }
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
