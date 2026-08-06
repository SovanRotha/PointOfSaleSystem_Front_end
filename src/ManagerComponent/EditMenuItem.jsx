import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  FileText,
  DollarSign,
  Barcode,
  Boxes,
  Layers,
  Sparkles,
  Edit3,
  Percent, // Added for discount icon
} from "lucide-react";

export default function EditMenuItem() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [menuItem, setMenuItem] = useState({
    category_id: "",
    name: "",
    description: "",
    image: null,
    sku: "",
    barcode: "",
    is_active: true,
    track_stock: true,
    stock_quantity: "",
    low_stock_threshold: "",
    cost_price: "",
    selling_price: "",
    discount: "", // Added discount state
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMenuItem(), fetchCategories()]);
    } catch (error) {
      console.error("Error loading component data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItem = async () => {
    try {
      const response = await api.get(`/api/menu-items/${id}`);
      const data = response.data.data || response.data;

      setMenuItem({
        category_id: data.category_id || "",
        name: data.name || "",
        description: data.description || "",
        image: null, // Keep null unless user uploads a replacement
        sku: data.sku || "",
        barcode: data.barcode || "",
        is_active: Boolean(data.is_active),
        track_stock: Boolean(data.track_stock),
        stock_quantity: data.stock_quantity ?? "",
        low_stock_threshold: data.low_stock_threshold ?? "",
        cost_price: data.cost_price ?? "",
        selling_price: data.selling_price ?? "",
        discount: data.discount ?? "", // Populate discount from API
      });

      if (data.image) {
        if (data.image.startsWith("http")) {
          setPreview(data.image);
        } else {
          setPreview(`http://localhost:8000/storage/${data.image}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch menu item details:", error);
      setErrors({
        general: ["Could not load menu item information."],
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setMenuItem((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuItem((prev) => ({
        ...prev,
        image: file,
      }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setMenuItem((prev) => ({
      ...prev,
      image: null,
    }));
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(menuItem).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === "boolean") {
            formData.append(key, value ? "1" : "0");
          } else {
            formData.append(key, value);
          }
        }
      });

      // Essential for Laravel Multipart POST mimicking PUT
      formData.append("_method", "PUT");

      await api.post(`/api/menu-items/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Menu item updated successfully!");

      setTimeout(() => {
        navigate("/manager/menu");
      }, 1000);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Failed to update item:", error);
        setErrors({
          general: [
            error.response?.data?.message || "An error occurred while updating.",
          ],
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-[#002B7F] animate-spin" />
          <p className="text-sm font-semibold text-slate-600">
            Fetching menu item details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/manager/menu")}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              Menu Management &gt; Items &gt;{" "}
              <span className="text-slate-700">Edit Item</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#002B7F] flex items-center gap-2">
              <span>Edit Menu Item</span>
              <span className="text-xs font-mono font-normal bg-blue-50 text-[#002B7F] px-2 py-0.5 rounded-md border border-blue-100">
                ID: #{id}
              </span>
            </h1>
          </div>
        </div>

        {/* Status Alerts */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {errors.general && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errors.general[0]}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Tag className="w-5 h-5 text-[#002B7F]" />
              <h2 className="text-base font-bold text-slate-800">
                General Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-600">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="category_id"
                    value={menuItem.category_id}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                      errors.category_id ? "border-red-500" : "border-slate-200"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-700 cursor-pointer`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category_id && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.category_id[0]}
                  </p>
                )}
              </div>

              {/* Item Name */}
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-600">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Margherita Pizza"
                    value={menuItem.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                      errors.name ? "border-red-500" : "border-slate-200"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.name[0]}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Describe item contents, taste profile, or special ingredients..."
                    value={menuItem.description}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Codes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <DollarSign className="w-5 h-5 text-[#002B7F]" />
              <h2 className="text-base font-bold text-slate-800">
                Pricing & Codes
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cost Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Cost Price ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    name="cost_price"
                    placeholder="0.00"
                    value={menuItem.cost_price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Selling Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    name="selling_price"
                    placeholder="0.00"
                    value={menuItem.selling_price}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                      errors.selling_price
                        ? "border-red-500"
                        : "border-slate-200"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]`}
                  />
                </div>
                {errors.selling_price && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.selling_price[0]}
                  </p>
                )}
              </div>

              {/* Discount Input Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Discount (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="discount"
                    placeholder="0.00"
                    value={menuItem.discount}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                      errors.discount ? "border-red-500" : "border-slate-200"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]`}
                  />
                </div>
                {errors.discount && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.discount[0]}
                  </p>
                )}
              </div>

              {/* SKU */}
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-600">
                  SKU Code
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="sku"
                    placeholder="e.g. PIZ-1001"
                    value={menuItem.sku}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>
              </div>

              {/* Barcode */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  Barcode
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="barcode"
                    placeholder="e.g. 123456789012"
                    value={menuItem.barcode}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Inventory & Image Upload */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Boxes className="w-5 h-5 text-[#002B7F]" />
              <h2 className="text-base font-bold text-slate-800">
                Inventory & Item Media
              </h2>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  name="track_stock"
                  checked={menuItem.track_stock}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#002B7F] focus:ring-[#002B7F] border-slate-300 cursor-pointer"
                />
                Track Stock Level
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={menuItem.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#002B7F] focus:ring-[#002B7F] border-slate-300 cursor-pointer"
                />
                Active (Visible on Menu)
              </label>
            </div>

            {/* Stock Quantities (Conditional) */}
            {menuItem.track_stock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    placeholder="0"
                    value={menuItem.stock_quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    placeholder="0"
                    value={menuItem.low_stock_threshold}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>
              </div>
            )}

            {/* Image Preview & Replacement */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Item Image
              </label>

              {preview ? (
                <div className="relative w-full h-56 rounded-2xl border border-slate-200 overflow-hidden group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-4 py-2 bg-white text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-slate-50 transition-all">
                      <Edit3 className="w-4 h-4 text-[#002B7F]" />
                      <span>Replace Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[160px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#002B7F] hover:bg-blue-50/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#002B7F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to upload replacement image
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG or WEBP (Max 2MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                </label>
              )}
              {errors.image && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.image[0]}
                </p>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/manager/menu")}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl font-semibold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? "Saving Changes..." : "Update Menu Item"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}