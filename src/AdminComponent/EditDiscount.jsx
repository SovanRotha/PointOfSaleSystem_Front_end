import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Tag,
  Percent,
  Utensils,
  AlertCircle,
  Sparkles,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function EditDiscount() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    menu_item_id: "",
    name: "",
    percentage: "",
    start_time: "",
    end_time: "",
    status: true,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchMenuItems(), fetchDiscount()]);
      } catch (error) {
        console.error("Error loading component data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, [id]);

  const fetchDiscount = async () => {
    try {
      const res = await api.get(`/api/discounts/${id}`);
      const discount = res.data.discount || res.data;

      setForm({
        menu_item_id: discount.menu_item_id || "",
        name: discount.name || "",
        percentage: discount.percentage || "",
        // Safely format ISO strings to 'YYYY-MM-DDTHH:mm' for datetime-local input
        start_time: discount.start_time ? discount.start_time.slice(0, 16) : "",
        end_time: discount.end_time ? discount.end_time.slice(0, 16) : "",
        status: Boolean(discount.status),
      });
    } catch (error) {
      console.error("Failed to fetch discount:", error.response?.data);
      setErrorMsg("Failed to load discount details. Please try again.");
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get("/api/menu-items");
      const fetchedItems = res.data.data || res.data || [];
      setItems(fetchedItems);
    } catch (error) {
      console.error("Failed to load menu items:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle select status as a boolean
    let parsedValue = value;
    if (name === "status") {
      parsedValue = value === "true" || value === true;
    } else if (type === "checkbox") {
      parsedValue = checked;
    }

    setForm((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await api.put(`/api/discounts/${id}`, form);
      navigate("/admin/discount");
    } catch (error) {
      console.error("Update failed:", error.response?.data);
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to update discount. Please check input values."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selected Item details for Live Calculation
  const selectedItem = items.find(
    (item) => String(item.id) === String(form.menu_item_id)
  );

  const originalPrice = Number(selectedItem?.selling_price || 0);
  const discountPercent = Number(form.percentage || 0);
  const finalPrice = originalPrice - (originalPrice * discountPercent) / 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discounts
        </button>

        {loadingData ? (
          /* Loading Skeleton */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm animate-pulse space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Container */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Edit Discount
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Modify promotion rates, item associations, and schedule status
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Target Menu Item Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Menu Item <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      name="menu_item_id"
                      value={form.menu_item_id}
                      onChange={handleChange}
                      className="w-full bg-slate-50 text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
                    >
                      <option value="">-- Select Menu Item --</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (${Number(item.selling_price).toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <Utensils className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Discount Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Discount Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Weekend Coffee Special"
                      className="w-full bg-slate-50 text-sm text-slate-800 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Percentage Off */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Discount Percentage (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      min="1"
                      max="100"
                      name="percentage"
                      value={form.percentage}
                      onChange={handleChange}
                      placeholder="e.g. 15"
                      className="w-full bg-slate-50 text-sm text-slate-800 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Start Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="start_time"
                      value={form.start_time}
                      onChange={handleChange}
                      className="w-full bg-slate-50 text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      End Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="end_time"
                      value={form.end_time}
                      onChange={handleChange}
                      className="w-full bg-slate-50 text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status ? "true" : "false"}
                    onChange={handleChange}
                    className="w-full bg-slate-50 text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive / Expired</option>
                  </select>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 flex items-center gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Discount
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin/discount")}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Live Price Calculation
                </h3>

                {selectedItem ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                        {selectedItem.image ? (
                          <img
                            src={`http://localhost:8000/storage/${selectedItem.image}`}
                            alt={selectedItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Utensils className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {selectedItem.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {form.name || "Special Promotion"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 text-sm border-t border-slate-100">
                      <div className="flex justify-between text-slate-500">
                        <span>Original Price:</span>
                        <span className="font-semibold text-slate-800">
                          ${originalPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-rose-600">
                        <span>Discount Rate ({discountPercent}%):</span>
                        <span className="font-semibold">
                          -${((originalPrice * discountPercent) / 100).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-base font-bold text-emerald-600 pt-2 border-t border-slate-100">
                        <span>Updated Sale Price:</span>
                        <span>${finalPrice > 0 ? finalPrice.toFixed(2) : "0.00"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Select a menu item above to preview pricing calculations.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}