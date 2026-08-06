import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Percent,
  Calendar,
} from "lucide-react";

export default function AddMenuItem() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
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
    low_stock_threshold: 0,
    cost_price: "",
    selling_price: "",
    // Discount fields
    apply_discount: false,
    discount_name: "",
    discount_percentage: "",
    discount_start_time: "",
    discount_end_time: "",
    discount_status: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setMenuItem((prev) => ({
      ...prev,
      image: null,
    }));
    setPreviewUrl("");
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

      await api.post("/api/menu-items", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Menu item created successfully!");

      setTimeout(() => {
        navigate("/admin/menu");
      }, 1000);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Failed to create menu item:", error);
        setErrors({
          general: [
            error.response?.data?.message || "Failed to create menu item.",
          ],
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/menu")}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              Menu Management &gt; Items &gt;{" "}
              <span className="text-slate-700">Add Item</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#002B7F]">
              Create New Menu Item
            </h1>
          </div>
        </div>

        {/* Banners */}
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

        {/* Form Container */}
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
              {/* Category */}
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
                    placeholder="e.g. Margherita Pizza, Iced Latte"
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
                    placeholder="Provide details about ingredients, flavors, or serving sizes..."
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* SKU */}
              <div className="space-y-1">
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
              <div className="space-y-1">
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

          {/* Card 3: Discount Options */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#002B7F]" />
                <h2 className="text-base font-bold text-slate-800">
                  Discount Options
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                <input
                  type="checkbox"
                  name="apply_discount"
                  checked={menuItem.apply_discount}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#002B7F] focus:ring-[#002B7F] border-slate-300 cursor-pointer"
                />
                Apply Initial Discount
              </label>
            </div>

            {menuItem.apply_discount && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Discount Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Discount Title
                    </label>
                    <input
                      type="text"
                      name="discount_name"
                      placeholder="e.g. Summer Promo, Happy Hour"
                      value={menuItem.discount_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>

                  {/* Discount Percentage */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Discount Percentage (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        name="discount_percentage"
                        placeholder="15.00"
                        value={menuItem.discount_percentage}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                      />
                    </div>
                  </div>

                  {/* Start Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Start Date & Time
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="datetime-local"
                        name="discount_start_time"
                        value={menuItem.discount_start_time}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-700"
                      />
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      End Date & Time
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="datetime-local"
                        name="discount_end_time"
                        value={menuItem.discount_end_time}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                    <input
                      type="checkbox"
                      name="discount_status"
                      checked={menuItem.discount_status}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-[#002B7F] focus:ring-[#002B7F] border-slate-300 cursor-pointer"
                    />
                    Discount Active
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Inventory & Image */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Boxes className="w-5 h-5 text-[#002B7F]" />
              <h2 className="text-base font-bold text-slate-800">
                Inventory & Item Media
              </h2>
            </div>

            {/* Checkboxes */}
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

            {/* Image Uploader */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Item Image
              </label>

              {previewUrl ? (
                <div className="relative w-full h-52 rounded-2xl border border-slate-200 overflow-hidden group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove Image</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[160px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#002B7F] hover:bg-blue-50/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#002B7F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to upload food item image
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/menu")}
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
              <span>{submitting ? "Saving..." : "Create Menu Item"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}