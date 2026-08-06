import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Package,
  Layers,
  Save,
  RotateCcw,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  FileText,
  Tag,
} from "lucide-react";

export default function EditInventory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Read-only metadata from API response for display context
  const [metaData, setMetaData] = useState({
    menuItemName: "",
    menuItemSku: "",
    menuItemImage: "",
    previousStock: 0,
    newStock: 0,
    userName: "",
    createdAt: "",
  });

  const [inventory, setInventory] = useState({
    menu_item_id: "",
    quantity_change: "",
    change_type: "addition",
    reason: "",
    user_id: "",
    order_id: "",
    notes: "",
  });

  useEffect(() => {
    fetchInventory();
  }, [id]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/api/stock_logs/${id}`);

      // Handle direct object or nested paginated array response
      const payload = response?.data;
      let data = payload?.stock_log || payload?.data || payload;

      if (Array.isArray(data)) {
        data = data.find((item) => String(item.id) === String(id)) || data[0];
      } else if (Array.isArray(data?.data)) {
        data = data.data.find((item) => String(item.id) === String(id)) || data.data[0];
      }

      if (!data) throw new Error("Record not found.");

      setInventory({
        menu_item_id: data.menu_item_id ?? "",
        quantity_change: data.quantity_change ?? "",
        change_type: data.change_type ?? "addition",
        reason: data.reason || "",
        user_id: data.user_id || "",
        order_id: data.order_id || "",
        notes: data.notes || "",
      });

      // Context metadata for side info card
      const menuItem = data.menu_item || {};
      const imagePath = menuItem.image;
      const imageUrl = imagePath
        ? imagePath.startsWith("http")
          ? imagePath
          : `http://localhost:8000/storage/${imagePath}`
        : null;

      setMetaData({
        menuItemName: menuItem.name || `Item #${data.menu_item_id}`,
        menuItemSku: menuItem.sku || `SKU-${data.menu_item_id}`,
        menuItemImage: imageUrl,
        previousStock: data.previous_stock ?? 0,
        newStock: data.new_stock ?? 0,
        userName: data.user?.name || "System",
        createdAt: data.created_at || "",
      });
    } catch (err) {
      console.error("Failed to fetch inventory log", err);
      setError("Unable to load stock log record. It may have been removed.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInventory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/api/stock_logs/${id}`, inventory);
      navigate("/manager/inventory");
    } catch (err) {
      console.error("Failed to update inventory", err);
      alert("Failed to update stock log. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3 p-6 text-slate-500">
        <Loader2 className="w-8 h-8 text-[#002B7F] animate-spin" />
        <p className="text-xs font-semibold">Loading stock log entry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              to="/manager/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#002B7F] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Inventory
            </Link>
            <h1 className="text-2xl font-extrabold text-[#002B7F] tracking-tight">
              Edit Stock Log #{id}
            </h1>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Context Card */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Item Details
                </h2>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 text-[#002B7F] font-bold text-xs">
                    {metaData.menuItemImage ? (
                      <img
                        src={metaData.menuItemImage}
                        alt={metaData.menuItemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {metaData.menuItemName}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 uppercase">
                      {metaData.menuItemSku}
                    </p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Stock Level Before</span>
                    <span className="font-bold text-slate-700">
                      {metaData.previousStock} Units
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Logged New Stock</span>
                    <span className="font-bold text-slate-800">
                      {metaData.newStock} Units
                    </span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span>Updated by: <strong className="text-slate-600">{metaData.userName}</strong></span>
                  </div>
                  {metaData.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(metaData.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Menu Item ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Menu Item ID
                    </label>
                    <input
                      type="number"
                      name="menu_item_id"
                      value={inventory.menu_item_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>

                  {/* Quantity Change */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Quantity Change
                    </label>
                    <input
                      type="number"
                      name="quantity_change"
                      value={inventory.quantity_change}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Change Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Change Type
                    </label>
                    <select
                      name="change_type"
                      value={inventory.change_type}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    >
                      <option value="addition">Addition (+)</option>
                      <option value="subtraction">Subtraction (-)</option>
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Reason
                    </label>
                    <input
                      type="text"
                      name="reason"
                      placeholder="e.g., Supplier Delivery, Spoilage"
                      value={inventory.reason}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>
                </div>

                {/* Optional References */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      User ID
                    </label>
                    <input
                      type="number"
                      name="user_id"
                      value={inventory.user_id}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="order_id"
                      placeholder="N/A"
                      value={inventory.order_id}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Notes / Remarks
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Add details about this inventory adjustment..."
                    value={inventory.notes}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate("/manager/inventory")}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#002B7F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-all inline-flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{submitting ? "Saving..." : "Update Inventory Log"}</span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}