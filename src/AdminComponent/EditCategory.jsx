import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  FileText,
  Activity,
} from "lucide-react";

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [category, setCategory] = useState({
    name: "",
    description: "",
    is_active: 1,
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Fetch Existing Category
  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/categories/${id}`);
      const data = response.data?.data || response.data || {};

      setCategory({
        name: data.name || "",
        description: data.description || "",
        is_active: data.is_active ? 1 : 0,
        image: null,
      });

      if (data.image) {
        setPreview(
          data.image.startsWith("http")
            ? data.image
            : `http://localhost:8000/storage/${data.image}`
        );
      }
    } catch (error) {
      console.error("Failed to fetch category:", error);
      setErrors((prev) => ({
        ...prev,
        general: ["Failed to load category details."],
      }));
    } finally {
      setLoading(false);
    }
  };

  // Input Change Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: name === "is_active" ? Number(value) : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategory((prev) => ({
        ...prev,
        image: file,
      }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setCategory((prev) => ({
      ...prev,
      image: null,
    }));
    setPreview("");
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", category.name);
      formData.append("description", category.description);
      formData.append("is_active", category.is_active);

      if (category.image) {
        formData.append("image", category.image);
      }

      // Laravel PUT method spoofing for FormData requests
      formData.append("_method", "PUT");

      await api.post(`/api/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Category updated successfully!");

      setTimeout(() => {
        navigate("/admin/menu");
      }, 1000);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Update failed:", error);
        setErrors({
          general: [
            error.response?.data?.message || "Failed to update category.",
          ],
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#002B7F] animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Fetching category details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
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
              Menu Management &gt; Categories &gt;{" "}
              <span className="text-slate-700">Edit Category</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#002B7F]">
              Edit Category
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Section 1: Image Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Category Image
              </label>

              {preview ? (
                <div className="relative w-full h-48 rounded-2xl border border-slate-200 overflow-hidden group">
                  <img
                    src={preview}
                    alt="Category Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Change Image</span>
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
                    Click to upload category image
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

            <hr className="border-slate-100" />

            {/* Section 2: Details */}
            <div className="space-y-4">
              
              {/* Category Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Appetizers, Main Course, Drinks"
                    value={category.name}
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

              {/* Category Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Brief description of items included in this category..."
                    value={category.description}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Status
                </label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="is_active"
                    value={category.is_active}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-700 cursor-pointer"
                  >
                    <option value={1}>Active (Visible on Menu)</option>
                    <option value={0}>Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

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
              <span>{submitting ? "Updating..." : "Update Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}