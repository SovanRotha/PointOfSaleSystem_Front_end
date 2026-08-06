import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  LayoutGrid,
  Users,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function AddTable() {
  const navigate = useNavigate();

  const [table, setTable] = useState({
    name: "",
    capacity: "",
    status: "available",
    location: "Main Floor",
  });

  const [loading, setLoading] = useState(false);

  const defaultLocations = ["Main Floor", "Patio", "Bar Area", "VIP Room"];

  const handleChange = (e) => {
    setTable({
      ...table,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationSelect = (loc) => {
    setTable((prev) => ({ ...prev, location: loc }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/api/tables", table);

      alert("Table created successfully!");
      navigate("/manager/table");
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Failed to create table.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen text-slate-800 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/manager/table")}
          className="flex items-center gap-2 text-slate-500 hover:text-[#002B7F] font-semibold text-sm mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Floor Management
        </button>

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#002B7F] p-6 text-white flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Add New Table
              </h1>
              <p className="text-blue-200 text-xs mt-1">
                Configure table capacity and assign it to a dining section.
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-blue-200" />
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Table Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#002B7F]" /> Table Name / Number
              </label>
              <input
                type="text"
                name="name"
                value={table.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] focus:border-transparent transition text-sm"
                placeholder="e.g. Table 07, T-12, or VIP-1"
                required
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#002B7F]" /> Seating Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={table.capacity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] focus:border-transparent transition text-sm"
                placeholder="e.g. 2, 4, 8"
                min="1"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#002B7F]" /> Initial Status
              </label>
              <select
                name="status"
                value={table.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] focus:border-transparent transition text-sm cursor-pointer"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            {/* Location Section */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#002B7F]" /> Location / Area
              </label>

              {/* Quick Select Location Pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {defaultLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocationSelect(loc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      table.location === loc
                        ? "bg-[#002B7F] text-white border-[#002B7F] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <input
                type="text"
                name="location"
                value={table.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] focus:border-transparent transition text-sm"
                placeholder="Custom location (e.g., Dining Room A)"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/manager/table")}
                className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition shadow-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#002B7F] hover:bg-blue-900 text-white font-semibold px-6 py-2.5 text-sm rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? "Saving Table..." : "Save Table"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTable;