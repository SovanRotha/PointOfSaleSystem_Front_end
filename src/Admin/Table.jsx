import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Plus, Users, Edit2, Trash2, MoreVertical } from "lucide-react";

function Table() {
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState("All");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get("/api/tables");
      setTables(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch tables", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this table?",
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/tables/${id}`);
      setTables((prev) => prev.filter((table) => table.id !== id));
    } catch (error) {
      console.error("Failed to delete table", error);
      alert("Failed to delete table.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/api/tables/${id}/status`, {
        status,
      });

      setTables((prev) =>
        prev.map((table) => (table.id === id ? { ...table, status } : table)),
      );
    } catch (error) {
      console.error(error);
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
            activeLocation.toLowerCase().trim(),
        );

  return (
    <div className="p-8 bg-slate-100 min-h-screen text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#002B7F] tracking-tight">
            Floor Management
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Real-time status of{" "}
            {activeLocation === "All" ? "all dining rooms" : activeLocation}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Location Tabs */}
          <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeLocation === loc
                    ? "bg-white text-[#002B7F] shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Add Table Button */}
          <button
            onClick={() => navigate("/admin/addTable")}
            className="flex items-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-2xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Add New Table
          </button>
        </div>
      </div>

      {/* Main Dotted Grid Floor Canvas */}
      <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 md:p-12 min-h-[600px] flex flex-col justify-between overflow-hidden">
        {/* SVG Dot Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-[#002B7F] 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top Marker: Front Entrance */}
        <div className="relative z-10 text-center mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/80 border border-slate-200/60 px-4 py-1.5 rounded-full">
            FRONT ENTRANCE
          </span>
        </div>

        {/* Floor Canvas Body */}
        <div className="relative z-10 my-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-medium">
              Loading floor plan...
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-medium">
              No tables found in this area.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {filteredTables.map((table) => {
                const isOccupied = table.status === "occupied";
                const isReserved = table.status === "reserved";

                return (
                  <div
                    key={table.id}
                    className={`relative rounded-2xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group ${
                      isOccupied
                        ? "bg-[#002B7F] border-[#002B7F] text-white"
                        : isReserved
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {/* Top Row: Table Number & Quick Actions */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`text-2xl font-extrabold tracking-tight ${
                            isOccupied || isReserved
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {table.name || `Table ${table.id}`}
                        </span>
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${
                            isOccupied || isReserved
                              ? "text-blue-100/90"
                              : "text-slate-500"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Cap: {table.capacity}</span>
                        </div>
                      </div>

                      {/* Card Action Buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
                        <button
                          onClick={() =>
                            navigate(`/admin/editTable/${table.id}`)
                          }
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
                              ? "hover:bg-rose-500/30 text-white"
                              : "hover:bg-rose-50 text-rose-500"
                          }`}
                          title="Delete Table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Dynamic Status Selector */}
                    <div className="mt-6 pt-3 border-t border-current/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                        Status
                      </span>
                      <select
                        value={table.status || "available"}
                        onChange={(e) =>
                          handleStatusChange(table.id, e.target.value)
                        }
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 outline-none transition cursor-pointer ${
                          isOccupied
                            ? "bg-white/10 text-white border border-white/20 focus:bg-white focus:text-[#002B7F]"
                            : isReserved
                              ? "bg-white/20 text-white border border-white/30 focus:bg-white focus:text-amber-700"
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
        </div>

        {/* Bottom Marker: Kitchen Entrance */}
        <div className="relative z-10 text-center mt-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/80 border border-slate-200/60 px-4 py-1.5 rounded-full">
            KITCHEN ENTRANCE
          </span>
        </div>
      </div>
    </div>
  );
}

export default Table;
