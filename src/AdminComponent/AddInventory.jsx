import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Package,
  Layers,
  PlusCircle,
  RotateCcw,
  Loader2,
  FileText,
  Tag,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

export default function AddInventory() {
  const navigate = useNavigate();

  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    menu_item_id: "",
    quantity_change: "",
    change_type: "addition",
    reason: "",
    user_id: "",
    order_id: "",
    notes: "",
  });

  // Fetch Menu Items and Users on load
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Menu Items
      try {
        setLoadingItems(true);
        const resItems = await api.get("/api/menu-items");
        const items = resItems?.data?.data || resItems?.data || [];
        setMenuItems(items);
      } catch (err) {
        console.error("Could not fetch menu items list", err);
      } finally {
        setLoadingItems(false);
      }

      // 2. Fetch Users
      try {
        setLoadingUsers(true);
        const resUsers = await api.get("/api/users");
        const userList = resUsers?.data?.data || resUsers?.data || [];
        setUsers(userList);
      } catch (err) {
        console.error("Could not fetch users list", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, []);

  // Find selected item & user for dynamic preview
  const selectedItem = menuItems.find(
    (item) => String(item.id) === String(form.menu_item_id)
  );

  const selectedUser = users.find(
    (u) => String(u.id) === String(form.user_id)
  );

  const currentStock = Number(selectedItem?.stock_quantity ?? 0);
  const qtyChange = Number(form.quantity_change || 0);
  const calculatedStock =
    form.change_type === "addition"
      ? currentStock + qtyChange
      : Math.max(0, currentStock - qtyChange);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.menu_item_id) {
      setError("Please select a menu item.");
      return;
    }

    if (!form.quantity_change || Number(form.quantity_change) <= 0) {
      setError("Please enter a valid quantity change.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/api/stock_logs", form);

      alert("Stock entry added successfully!");
      navigate("/admin/inventory");
    } catch (err) {
      console.error("Failed to add inventory record", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save inventory record. Please check your inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              to="/admin/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#002B7F] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Inventory
            </Link>
            <h1 className="text-2xl font-extrabold text-[#002B7F] tracking-tight">
              Add Stock Entry
            </h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Live Details Card */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Summary Preview
              </h2>

              {selectedItem ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 text-[#002B7F] font-bold text-xs">
                      {selectedItem.image ? (
                        <img
                          src={
                            selectedItem.image.startsWith("http")
                              ? selectedItem.image
                              : `http://localhost:8000/storage/${selectedItem.image}`
                          }
                          alt={selectedItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1">
                        {selectedItem.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400 uppercase">
                        {selectedItem.sku || `ID: ${selectedItem.id}`}
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Current Stock</span>
                      <span className="font-bold text-slate-700">
                        {currentStock} Units
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>Adjustment</span>
                      <span
                        className={`font-bold flex items-center gap-0.5 ${
                          form.change_type === "addition"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {form.change_type === "addition" ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {form.change_type === "addition" ? "+" : "-"}
                        {qtyChange}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-800 font-extrabold pt-2 border-t border-slate-100 text-sm">
                      <span>New Total</span>
                      <span className="text-[#002B7F]">
                        {calculatedStock} Units
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2 text-slate-400">
                  <Package className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs">Select an item to view stock calculations.</p>
                </div>
              )}

              {/* Logged User Info */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Logged by:{" "}
                  <strong className="text-slate-700">
                    {selectedUser ? selectedUser.name : "Unassigned"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Select Menu Item */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Select Menu Item
                  </label>
                  <select
                    name="menu_item_id"
                    value={form.menu_item_id}
                    onChange={handleChange}
                    disabled={loadingItems}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] disabled:opacity-60"
                  >
                    <option value="">
                      {loadingItems ? "Loading menu items..." : "-- Select Item --"}
                    </option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Stock: {item.stock_quantity ?? 0})
                      </option>
                    ))}
                  </select>
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
                    placeholder="e.g. 50"
                    min="1"
                    value={form.quantity_change}
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
                    value={form.change_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  >
                    <option value="addition">Addition (+ Restock)</option>
                    <option value="subtraction">Subtraction (- Spoilage/Removal)</option>
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
                    placeholder="e.g. New stock delivery"
                    value={form.reason}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  />
                </div>
              </div>

              {/* User Selection & Order ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Select User Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    Logged By (User)
                  </label>
                  <select
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    disabled={loadingUsers}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] disabled:opacity-60"
                  >
                    <option value="">
                      {loadingUsers ? "Loading users..." : "-- Select Staff / User --"}
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="order_id"
                    placeholder="e.g. ORD-1092"
                    value={form.order_id}
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
                  placeholder="Add optional notes or adjustment remarks..."
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/admin/inventory")}
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
                    <PlusCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{submitting ? "Saving..." : "Save Stock Entry"}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}