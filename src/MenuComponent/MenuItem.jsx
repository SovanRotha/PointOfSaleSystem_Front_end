import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Search,
  Plus,
  Filter,
  Utensils,
  Tag,
  Boxes,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trash2,
  Clock,
  Zap,
} from "lucide-react";

// Live Countdown Timer Component
function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  function calculateTimeLeft(target) {
    if (!target) return null;
    const formattedDate = target.replace(" ", "T");
    const difference = +new Date(formattedDate) - +new Date();
    if (difference <= 0) return null;

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft(targetDate);
      setTimeLeft(updated);
      if (!updated) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <span className="text-[10px] text-slate-400 font-medium italic">
        Expired
      </span>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
      <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
      <span>
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  );
}

export default function MenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const menuEndpoint = id
        ? `/api/menu-items/${id}/categories`
        : "/api/menu-items";

      // Fetch both All Menu Items and All Discounts in parallel
      const [menuRes, discountsRes] = await Promise.all([
        api.get(menuEndpoint),
        api.get("/api/discounts"),
      ]);

      const rawMenuItems =
        menuRes.data?.data || menuRes.data?.menuItems || menuRes.data || [];
      const discountsList = discountsRes.data?.discounts || [];

      // Map discounts to their respective menu items
      const mergedItems = rawMenuItems.map((item) => {
        // Find an active discount assigned to this menu_item_id
        const activeDiscount = discountsList.find(
          (d) => d.menu_item_id === item.id && d.status === true
        );

        return {
          ...item,
          discount: activeDiscount || null,
        };
      });

      setMenuItems(mergedItems);
    } catch (error) {
      console.error("Failed to load catalog data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getItemImage = (image) => {
    if (!image) return null;
    return image.startsWith("http")
      ? image
      : `http://localhost:8000/storage/${image}`;
  };

  // Safe category list extraction
  const categories = Array.from(
    new Set(menuItems.map((item) => item.category?.name).filter(Boolean))
  );

  // Filter items by search query or category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || item.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?"))
      return;

    try {
      await api.delete(`/api/menu-items/${itemId}`);
      setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Could not delete item. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">
              Menu Management &gt;{" "}
              <span className="text-slate-700">Menu Items</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#002B7F] mt-1">
              Menu Catalog
            </h1>
          </div>

          <button
            onClick={() => navigate("/admin/menu/addMenuItem")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
            />
          </div>

          <div className="relative w-full md:w-56">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-700 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="min-h-[300px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#002B7F] animate-spin" />
            <p className="text-sm font-medium text-slate-500">
              Loading menu catalog...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Menu Items Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any items matching your filters. Try adjusting
              your search query or add a new menu item.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const imageSrc = getItemImage(item.image);

              // Discount Calculations (if item has attached discount)
              const discount = item.discount;
              const hasDiscount = !!discount;
              const originalPrice = Number(item.selling_price || 0);
              const discountPercent = hasDiscount
                ? Number(discount.percentage)
                : 0;
              const discountedPrice = hasDiscount
                ? originalPrice * (1 - discountPercent / 100)
                : originalPrice;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1 bg-slate-50">
                          <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                          <span className="text-[11px] font-medium text-slate-400">
                            No image available
                          </span>
                        </div>
                      )}

                      {/* Discount Percentage Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-md animate-bounce">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>-{discountPercent}% OFF</span>
                        </div>
                      )}

                      {/* Active Status Badge */}
                      <div className="absolute top-3 right-3">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-700/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </div>

                      {/* Category Badge */}
                      {item.category?.name && (
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1.5 bg-white/95 text-[#002B7F] text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm">
                            <Tag className="w-3 h-3" /> {item.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      {/* Name & SKU */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="text-base font-bold text-slate-800 line-clamp-1">
                            {item.name}
                          </h2>
                          {item.sku && (
                            <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                              {item.sku}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                          {item.description || "No description provided."}
                        </p>
                      </div>

                      {/* Price Grid */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {hasDiscount ? "Promo Price" : "Selling Price"}
                            </span>
                            <div className="flex items-baseline gap-2">
                              {/* Price Display */}
                              {hasDiscount ? (
                                <>
                                  <span className="text-base font-extrabold text-red-600">
                                    ${discountedPrice.toFixed(2)}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-400 line-through">
                                    ${originalPrice.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-base font-extrabold text-[#002B7F]">
                                  ${originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right border-l border-slate-200 pl-3">
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Cost Price
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              ${Number(item.cost_price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Live Countdown Timer if discounted */}
                        {hasDiscount && discount.end_time && (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500">
                              Ends In:
                            </span>
                            <CountdownTimer targetDate={discount.end_time} />
                          </div>
                        )}
                      </div>

                      {/* Stock Tracker */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Boxes className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold">Stock:</span>
                        </div>
                        {item.track_stock ? (
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                              item.stock_quantity <= item.low_stock_threshold
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.stock_quantity} units
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium italic text-[11px]">
                            Untracked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/menu/editMenuItem/${item.id}`)
                      }
                      className="text-xs font-bold text-[#002B7F] hover:text-blue-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white"
                    >
                      <span>Edit Item</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}