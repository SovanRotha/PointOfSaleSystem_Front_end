import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Calendar,
  Clock,
  Search,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function Discount() {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get("/api/discounts");
      setDiscounts(res.data.discounts || []);
    } catch (error) {
      console.error("Error fetching discounts:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this discount?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/discounts/${id}`);
      // Optimistic UI update: remove immediately from state
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error(error.response?.data);
      alert("Failed to delete discount");
    }
  };

  // Format Date String safely
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  // Filter discounts based on search input
  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.menu_item?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Discounts & Promotions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage active menu deals and price markdowns
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/addDiscount")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Discount
        </button>
      </div>

      {/* Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search deals or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-sm text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Deals: <span className="text-slate-900">{filteredDiscounts.length}</span>
        </div>
      </div>

      {/* Skeleton Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm animate-pulse flex flex-col gap-4"
            >
              <div className="w-full h-44 bg-slate-200 rounded-xl"></div>
              <div className="h-5 bg-slate-200 rounded w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-10 bg-slate-100 rounded-xl mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredDiscounts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No discounts found
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {searchQuery
              ? "No items match your search term."
              : "You haven't added any promotional discounts yet."}
          </p>
          <button
            onClick={() => navigate("/admin/addDiscount")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Create First Deal
          </button>
        </div>
      ) : (
        /* Discounts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiscounts.map((discount) => {
            const price = Number(discount.menu_item?.selling_price || 0);
            const percentage = Number(discount.percentage || 0);
            const finalPrice = price - (price * percentage) / 100;
            const isActive = Boolean(discount.status);

            return (
              <div
                key={discount.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header Image & Overlay Badge */}
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={`http://localhost:8000/storage/${discount.menu_item?.image}`}
                      alt={discount.menu_item?.name || "Menu item"}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"; // Fallback image
                      }}
                    />

                    {/* Badge: Percentage Off */}
                    <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {percentage}% OFF
                    </div>

                    {/* Badge: Status */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm border ${
                          isActive
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-slate-800/80 text-slate-200 border-slate-700 backdrop-blur-sm"
                        }`}
                      >
                        {isActive ? "Active" : "Expired"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Promotion Name */}
                  <div className="mt-4">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      {discount.menu_item?.name || "Unnamed Item"}
                    </h2>
                    <p className="text-xs font-medium text-indigo-600 mt-0.5 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {discount.name || "Special Offer"}
                    </p>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                        Original
                      </span>
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        ${price.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold uppercase text-emerald-600 block">
                        Discount Price
                      </span>
                      <span className="text-lg font-extrabold text-emerald-600">
                        ${finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Time Schedule */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Start: {formatDate(discount.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>End: {formatDate(discount.end_time)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() =>
                      navigate(`/admin/editDiscount/${discount.id}`)
                    }
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(discount.id)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}