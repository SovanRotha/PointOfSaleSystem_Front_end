import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Search,
  Bell,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  GripVertical,
  Info,
  Wine,
  Cake,
  Snowflake,
  Coffee,
  ImageOff,
  Loader2,
  Check,
} from "lucide-react";

export default function Category() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/categories");
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Delete Category
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Failed to delete category."
      );
    }
  };

  // Helper to map category names to Lucide icons dynamically
  const getCategoryIcon = (name = "") => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("appetizer") || lowerName.includes("starter"))
      return <UtensilsCrossed className="w-5 h-5 text-blue-600" />;
    if (lowerName.includes("main") || lowerName.includes("course"))
      return <UtensilsCrossed className="w-5 h-5 text-blue-600" />;
    if (lowerName.includes("dessert") || lowerName.includes("cake"))
      return <Cake className="w-5 h-5 text-blue-600" />;
    if (lowerName.includes("beverage") || lowerName.includes("drink"))
      return <Wine className="w-5 h-5 text-blue-600" />;
    if (lowerName.includes("season") || lowerName.includes("special"))
      return <Snowflake className="w-5 h-5 text-slate-500" />;
    return <Coffee className="w-5 h-5 text-blue-600" />;
  };

  // Filter categories based on search input
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 space-y-6">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories, items, or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
          />
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">Admin User</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                Main Branch
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs overflow-hidden">
              AU
            </div>
            <button
              onClick={() => navigate("/login")}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium mb-1">
            Menu Management &gt; <span className="text-slate-700">Categories</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#002B7F]">
            Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize your menu offerings into logical groups for your customers and kitchen staff.
          </p>
        </div>

        <div className="flex gap-1.5">
            <button
        onClick = {() => navigate("/admin/menu/modifier")}
        className="flex items-center justify-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all"
        >
          <Check className="w-4 h-4" />
          <span>View Modifier</span>
        </button>

        <button
          onClick={() => navigate("/admin/menu/addCategory")}
          className="flex items-center justify-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
        </div>
        
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#002B7F]" />
          <p className="text-sm font-medium">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Side: Categories Grid (3 Columns) */}
          <div  className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredCategories.map((category) => {
              const isActive = Boolean(category.is_active);
              const itemCount = category.menu_item_count ?? 0;

              return (
                <div
                  key={category.id}
                  onClick={()=>navigate(`/admin/menu/menuItem/${category.id}`)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Card Bar: Icon + Action Buttons */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? "bg-blue-50" : "bg-slate-100"
                        }`}
                      >
                        {getCategoryIcon(category.name)}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/menu/editCategory/${category.id}`
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-[#002B7F] hover:bg-slate-50 rounded-lg transition-all"
                          title="Edit Category"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Category Title */}
                    <h3 className="font-bold text-slate-900 text-base">
                      {category.name}
                    </h3>

                    {/* Status Pill & Items Count */}
                    <div className="flex items-center gap-2 mt-1 mb-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                          isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        • {itemCount} Items
                      </span>
                    </div>

                    {/* Category Image Card */}
                    <div className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 flex items-center justify-center">
                      {category.image ? (
                        <img
                          src={
                            category.image.startsWith("http")
                              ? category.image
                              : `http://localhost:8000/storage/${category.image}`
                          }
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <ImageOff className="w-8 h-8 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create New Category Placeholder Card */}
            <div
              onClick={() => navigate("/admin/menu/addCategory")}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[260px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#002B7F] hover:bg-blue-50/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#002B7F] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700 group-hover:text-[#002B7F]">
                Create New Category
              </p>
            </div>
          </div>

          {/* Right Side: Reorder Sidebar Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6 h-fit">
            
            {/* Sidebar Title */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Menu Display Order
                </h3>
              </div>
              <button className="text-xs font-semibold text-[#002B7F] hover:underline">
                Save Order
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Drag and drop to reorder how categories appear on the customer-facing menu.
            </p>

            {/* Reorderable Items List */}
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl cursor-grab hover:border-slate-300 transition-all"
                >
                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Tip Banner */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-[#002B7F]">
                <Info className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Quick Tip
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Display order affects both the Digital Kiosk and the printed Menu exports.
              </p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}