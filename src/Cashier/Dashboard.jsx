import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Clock,
  Award,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState("All");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tablesRes, dashRes] = await Promise.all([
        api.get("/api/tables"),
        api.get("/api/dashboard"),
      ]);

      // Handle table response structure safely
      const tablesList = tablesRes.data?.data || tablesRes.data || [];
      setTables(Array.isArray(tablesList) ? tablesList : []);

      // Set metrics response
      setDashboardData(dashRes.data?.data || dashRes.data || null);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;

    try {
      await api.delete(`/api/tables/${id}`);
      setTables((prev) => prev.filter((table) => table.id !== id));
    } catch (error) {
      console.error("Failed to delete table:", error);
      alert("Failed to delete table.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/api/tables/${id}/status`, { status });
      setTables((prev) =>
        prev.map((table) => (table.id === id ? { ...table, status } : table))
      );
    } catch (error) {
      console.error("Failed to update table status:", error);
      alert("Failed to update table status.");
    }
  };

  // Filter tables by location tab
  const locations = ["All", "Main Floor", "Patio", "Bar Area"];
  const filteredTables =
    activeLocation === "All"
      ? tables
      : tables.filter(
          (t) =>
            t.location?.toLowerCase().trim() ===
            activeLocation.toLowerCase().trim()
        );

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002B7F] tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Overview of live performance, inventory alerts, and floor management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {/* <button
            onClick={() => navigate("/cashier/addTable")}
            className="flex items-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Table
          </button> */}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Today Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Sales
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              ${dashboardData?.today_sales || "0.00"}
            </h3>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Updated live
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002B7F] flex items-center justify-center font-bold">
            $
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {dashboardData?.order_count ?? 0}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Processed today
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Tables
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {dashboardData?.tables?.active ?? 0} / {dashboardData?.tables?.total ?? tables.length}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Currently occupied
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Low Stock Alerts
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {dashboardData?.low_stock ?? 0}
            </h3>
            <p className="text-[11px] font-semibold text-rose-500 mt-1">
              Items need restock
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Floor Management Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Floor Layout</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or modify table statuses in real-time
            </p>
          </div>

          {/* Location Filters */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto border border-slate-200/60">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeLocation === loc
                    ? "bg-white text-[#002B7F] shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Grid Canvas */}
        <div className="relative bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl p-6 md:p-10 min-h-[420px] flex flex-col justify-between">
          <div className="text-center mb-6">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              FRONT ENTRANCE
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#002B7F]" />
              <p className="text-sm font-medium">Loading floor plan...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium">
              No tables registered for this area.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredTables.map((table) => {
                const isOccupied = table.status === "occupied";
                const isReserved = table.status === "reserved";

                return (
                  <div
                    key={table.id}
                    className={`relative rounded-2xl p-5 border transition-all duration-200 shadow-2xs flex flex-col justify-between ${
                      isOccupied
                        ? "bg-[#002B7F] border-[#002B7F] text-white"
                        : isReserved
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    {/* Header: Table Name & Actions */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-extrabold tracking-tight">
                          {table.name || `Table ${table.id}`}
                        </h3>
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${
                            isOccupied || isReserved
                              ? "text-white/80"
                              : "text-slate-500"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Cap: {table.capacity || 4}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* <button
                          onClick={() => navigate(`/cashier/editTable/${table.id}`)}
                          className={`p-1.5 rounded-lg transition ${
                            isOccupied || isReserved
                              ? "hover:bg-white/20 text-white"
                              : "hover:bg-slate-100 text-slate-500"
                          }`}
                          title="Edit Table"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(table.id)}
                          className={`p-1.5 rounded-lg transition ${
                            isOccupied || isReserved
                              ? "hover:bg-rose-500/40 text-white"
                              : "hover:bg-rose-50 text-rose-500"
                          }`}
                          title="Delete Table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button> */}
                      </div>
                    </div>

                    {/* Bottom Status Picker */}
                    <div className="mt-6 pt-3 border-t border-current/10 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                        Status
                      </span>
                      <select
                        value={table.status || "available"}
                        onChange={(e) => handleStatusChange(table.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 outline-none transition cursor-pointer ${
                          isOccupied
                            ? "bg-white/20 text-white border border-white/30 focus:bg-white focus:text-[#002B7F]"
                            : isReserved
                            ? "bg-white/20 text-white border border-white/30 focus:bg-white focus:text-amber-800"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 focus:bg-emerald-100"
                        }`}
                      >
                        <option value="available" className="text-slate-800">
                          Available
                        </option>
                        <option value="occupied" className="text-slate-800">
                          Occupied
                        </option>
                        <option value="reserved" className="text-slate-800">
                          Reserved
                        </option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-6">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              KITCHEN ENTRANCE
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#002B7F]" /> Recent Activity Log
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Live Feed</span>
          </div>

          <div className="space-y-3">
            {dashboardData?.recent_activity?.length > 0 ? (
              dashboardData.recent_activity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#002B7F] font-bold text-xs flex items-center justify-center">
                      #{activity.order_id}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {activity.menu_item?.name || "Menu Item"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Reason: {activity.reason} by {activity.user?.name || "Staff"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                    -{activity.quantity_change} Stock
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No recent activity logged.
              </p>
            )}
          </div>
        </div>

        {/* Top Seller Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Top Item Today
              </h3>
            </div>

            {dashboardData?.top_item ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <h4 className="text-base font-extrabold text-slate-800">
                  {dashboardData.top_item.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  SKU: {dashboardData.top_item.sku || "N/A"}
                </p>
                <div className="mt-4 flex justify-center gap-6 text-slate-700">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Sold
                    </span>
                    <span className="text-lg font-extrabold text-[#002B7F]">
                      {dashboardData.top_item.sold_quantity}
                    </span>
                  </div>
                  <div className="border-r border-slate-200"></div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Price
                    </span>
                    <span className="text-lg font-extrabold text-slate-800">
                      ${dashboardData.top_item.selling_price}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                No sales data recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}