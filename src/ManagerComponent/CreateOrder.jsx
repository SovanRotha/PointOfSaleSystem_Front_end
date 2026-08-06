import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  Sliders,
  X,
  Check,
  Receipt,
  FileText,
  ArrowRight,
  Trash2,
  Tag,
} from "lucide-react";

function ManagerOrder() {
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  // Modifiers state
  const [modalModifiers, setModalModifiers] = useState([]);
  const [showModifier, setShowModifier] = useState(false);
  const [modifierCache, setModifierCache] = useState({});

  // Active cart target state
  const [selectedCartIndex, setSelectedCartIndex] = useState(null);
  const [tempModifiers, setTempModifiers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Simple form state (No need to calculate totals here to send to server)
  const [order, setOrder] = useState({
    table_id: "",
    type: "dine_in",
    tax: 0,
    discount: 0, // Manual optional order discount
    service_charge: 0,
    notes: "",
    items: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tableRes, menuRes] = await Promise.all([
          api.get("/api/tables"),
          api.get("/api/menu-items"),
        ]);

        setTables(tableRes.data.data || tableRes.data || []);
        setMenuItems(menuRes.data.data || menuRes.data || []);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    fetchData();
  }, []);

  const cacheModifiers = (modifierList) => {
    setModifierCache((prev) => {
      const updated = { ...prev };
      modifierList.forEach((mod) => {
        updated[mod.id] = mod;
      });
      return updated;
    });
  };

  // Extract pricing info for live UI estimates
  const getItemPricingDetails = (menuItem) => {
    const originalPrice = Number(menuItem.selling_price || menuItem.price || 0);

    const activeDiscountObj = Array.isArray(menuItem.discount)
      ? menuItem.discount.find((d) => d.status === true || d.status === 1)
      : null;

    const discountPercentage = activeDiscountObj
      ? Number(activeDiscountObj.percentage || 0)
      : 0;

    const discountAmount = (originalPrice * discountPercentage) / 100;
    const effectivePrice = Math.max(0, originalPrice - discountAmount);

    return {
      originalPrice,
      discountPercentage,
      discountAmount,
      effectivePrice,
    };
  };

  const increase = (item) => {
    setOrder((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { menu_item_id: item.id, quantity: 1, modifiers: [] },
      ],
    }));
  };

  const decrease = (item) => {
    setOrder((prev) => {
      const indexToRemove = [...prev.items]
        .reverse()
        .findIndex((i) => i.menu_item_id === item.id);

      if (indexToRemove === -1) return prev;

      const actualIndex = prev.items.length - 1 - indexToRemove;
      const updatedItems = prev.items.filter((_, idx) => idx !== actualIndex);

      return { ...prev, items: updatedItems };
    });
  };

  const updateCartItemQuantity = (index, delta) => {
    setOrder((prev) => {
      const updatedItems = prev.items
        .map((item, idx) => {
          if (idx === index) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      return { ...prev, items: updatedItems };
    });
  };

  const removeCartItem = (index) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const getItemTotalQuantity = (id) => {
    return order.items
      .filter((i) => i.menu_item_id === id)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const openModifierForCartItem = async (cartIndex, menuItem) => {
    try {
      const response = await api.get(`/api/modifiers/${menuItem.id}/menuItems`);
      const fetchedMods = response.data.data || response.data || [];

      cacheModifiers(fetchedMods);
      setModalModifiers(fetchedMods);
      setSelectedCartIndex(cartIndex);

      const cartItem = order.items[cartIndex];
      setTempModifiers(
        cartItem?.modifiers ? JSON.parse(JSON.stringify(cartItem.modifiers)) : []
      );

      setShowModifier(true);
    } catch (error) {
      console.error("Error fetching modifiers:", error);
    }
  };

  const openModifierFromGrid = async (item) => {
    let targetIndex = order.items.findLastIndex(
      (i) => i.menu_item_id === item.id
    );

    if (targetIndex === -1) {
      const newItem = { menu_item_id: item.id, quantity: 1, modifiers: [] };
      setOrder((prev) => ({ ...prev, items: [...prev.items, newItem] }));
      targetIndex = order.items.length;
    }

    await openModifierForCartItem(targetIndex, item);
  };

  const addModifier = (modifier) => {
    setTempModifiers((prev) => {
      const exist = prev.find((m) => m.modifier_id === modifier.id);
      if (exist) {
        return prev.map((m) =>
          m.modifier_id === modifier.id
            ? { ...m, quantity: m.quantity + 1 }
            : m
        );
      }
      return [...prev, { modifier_id: modifier.id, quantity: 1 }];
    });
  };

  const decreaseModifier = (modifier) => {
    setTempModifiers((prev) =>
      prev
        .map((m) =>
          m.modifier_id === modifier.id
            ? { ...m, quantity: m.quantity - 1 }
            : m
        )
        .filter((m) => m.quantity > 0)
    );
  };

  const saveModifier = () => {
    if (selectedCartIndex === null) return;

    setOrder((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === selectedCartIndex
          ? { ...item, modifiers: tempModifiers }
          : item
      ),
    }));

    setShowModifier(false);
    setSelectedCartIndex(null);
  };

  // --- UI Estimated Calculations ---
  const estSubtotal = order.items.reduce((sum, cartItem) => {
    const menu = menuItems.find((m) => m.id === cartItem.menu_item_id);
    if (!menu) return sum;

    const { originalPrice } = getItemPricingDetails(menu);
    const itemPrice = originalPrice * cartItem.quantity;

    const modifierPrice = cartItem.modifiers.reduce(
      (modifierSum, selectedModifier) => {
        const modifier = modifierCache[selectedModifier.modifier_id];
        const price = modifier ? Number(modifier.price) : 0;
        return modifierSum + price * selectedModifier.quantity * cartItem.quantity;
      },
      0
    );

    return sum + itemPrice + modifierPrice;
  }, 0);

  const estItemDiscounts = order.items.reduce((sum, cartItem) => {
    const menu = menuItems.find((m) => m.id === cartItem.menu_item_id);
    if (!menu) return sum;

    const { discountAmount } = getItemPricingDetails(menu);
    return sum + discountAmount * cartItem.quantity;
  }, 0);

  const totalDiscounts = estItemDiscounts + Number(order.discount || 0);

  const estGrandTotal = Math.max(
    0,
    estSubtotal -
      totalDiscounts +
      Number(order.tax || 0) +
      Number(order.service_charge || 0)
  );

  // --- SUBMIT ORDER TO BACKEND ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (order.items.length === 0) {
      alert("Please select at least one menu item.");
      return;
    }

    // Clean payload: Send raw choices, backend handles actual financial math
    const payload = {
      table_id: order.table_id ? Number(order.table_id) : null,
      type: order.type,
      tax: Number(order.tax || 0),
      discount: Number(order.discount || 0), // Optional manual discount
      service_charge: Number(order.service_charge || 0),
      notes: order.notes,
      items: order.items.map((i) => ({
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        modifiers: i.modifiers,
      })),
    };

    try {
      setSubmitting(true);
      await api.post("/api/orders", payload);
      alert("Order created successfully!");
      navigate("/admin/order");
    } catch (error) {
      console.error("Order Creation Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeSelectedItemDetails =
    selectedCartIndex !== null && order.items[selectedCartIndex]
      ? menuItems.find(
          (m) => m.id === order.items[selectedCartIndex].menu_item_id
        )
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-[#002B7F] tracking-tight flex items-center gap-2.5">
              <Utensils className="w-6 h-6" />
              Create New Order
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select items from the menu, add modifiers, and assign tables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-[#002B7F] border border-blue-100 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items Selected
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Items View */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Configuration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assign Table
                  </label>
                  <select
                    value={order.table_id}
                    onChange={(e) =>
                      setOrder({ ...order, table_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  >
                    <option value="">-- Select Table --</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Order Type
                  </label>
                  <select
                    value={order.type}
                    onChange={(e) =>
                      setOrder({ ...order, type: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                  >
                    <option value="dine_in">Dine In</option>
                    <option value="takeaway">Take Away</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Order Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or kitchen notes..."
                  value={order.notes}
                  onChange={(e) =>
                    setOrder({ ...order, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002B7F] resize-none"
                />
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-800">Menu Items</h2>
                <span className="text-xs text-slate-400">{menuItems.length} Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {menuItems.map((item) => {
                  const qty = getItemTotalQuantity(item.id);
                  const {
                    originalPrice,
                    discountPercentage,
                    effectivePrice,
                  } = getItemPricingDetails(item);

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                        qty > 0
                          ? "border-[#002B7F] ring-1 ring-[#002B7F]/20"
                          : "border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="relative w-full h-28 bg-slate-100 rounded-xl mb-3 overflow-hidden border border-slate-100 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={
                                item.image.startsWith("http")
                                  ? item.image
                                  : `http://localhost:8000/storage/${item.image}`
                              }
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Utensils className="w-8 h-8 text-slate-300 stroke-1" />
                          )}

                          {discountPercentage > 0 && (
                            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                              <Tag className="w-3 h-3" />
                              {discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1">
                            {item.name}
                          </h3>
                          <div className="text-right shrink-0">
                            {discountPercentage > 0 && (
                              <span className="block text-[10px] text-slate-400 line-through font-mono">
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="font-mono text-xs font-bold text-[#002B7F]">
                              ${effectivePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mb-2">
                          Stock:{" "}
                          <span className="font-semibold text-slate-600">
                            {item.stock_quantity ?? "N/A"}
                          </span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => decrease(item)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg bg-white shadow-xs text-slate-600 hover:text-red-600 flex items-center justify-center disabled:opacity-40 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => increase(item)}
                              className="w-7 h-7 rounded-lg bg-white shadow-xs text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => openModifierFromGrid(item)}
                            className="p-2 text-slate-500 hover:text-[#002B7F] hover:bg-slate-100 rounded-xl transition-all"
                            title="Configure Modifiers"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-[#002B7F] flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Order Summary
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {order.type.replace("_", " ").toUpperCase()}
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {order.items.length === 0 ? (
                  <div className="py-10 text-center space-y-2 text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto stroke-1" />
                    <p className="text-xs">No items added to order yet.</p>
                  </div>
                ) : (
                  order.items.map((cartItem, index) => {
                    const menu = menuItems.find((m) => m.id === cartItem.menu_item_id);
                    const { discountAmount, effectivePrice } = menu
                      ? getItemPricingDetails(menu)
                      : { discountAmount: 0, effectivePrice: 0 };

                    return (
                      <div
                        key={`${cartItem.menu_item_id}-${index}`}
                        className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100"
                      >
                        <div className="flex justify-between font-extrabold text-slate-800">
                          <span>{menu?.name} #{index + 1}</span>
                          <div className="flex items-center gap-2">
                            <span>${(effectivePrice * cartItem.quantity).toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => removeCartItem(index)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-slate-400 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateCartItemQuantity(index, -1)}
                              className="w-4 h-4 rounded bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span>
                              Qty: <strong>{cartItem.quantity}</strong> × ${effectivePrice.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartItemQuantity(index, 1)}
                              className="w-4 h-4 rounded bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => openModifierForCartItem(index, menu)}
                            className="text-[#002B7F] hover:underline font-semibold flex items-center gap-1"
                          >
                            <Sliders className="w-3 h-3" /> Edit Mods
                          </button>
                        </div>

                        {discountAmount > 0 && (
                          <div className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Saved: ${(discountAmount * cartItem.quantity).toFixed(2)}
                          </div>
                        )}

                        {cartItem.modifiers.length > 0 && (
                          <div className="pl-2 border-l-2 border-slate-200 space-y-1 mt-1 text-[11px] text-slate-500">
                            {cartItem.modifiers.map((selectedMod) => {
                              const modifier = modifierCache[selectedMod.modifier_id];
                              return (
                                <div key={selectedMod.modifier_id} className="flex justify-between items-center">
                                  <span>+ {modifier?.name || `Mod #${selectedMod.modifier_id}`} (x{selectedMod.quantity})</span>
                                  <span className="font-mono">
                                    +${(Number(modifier?.price || 0) * selectedMod.quantity * cartItem.quantity).toFixed(2)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Controls for Tax, Manual Discount & Service Charge */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Tax ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={order.tax}
                      onChange={(e) =>
                        setOrder({ ...order, tax: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Manual Disc ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={order.discount}
                      onChange={(e) =>
                        setOrder({ ...order, discount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Service ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={order.service_charge}
                      onChange={(e) =>
                        setOrder({ ...order, service_charge: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Estimated Math Preview */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Est. Subtotal</span>
                  <span className="font-mono font-bold text-slate-700">${estSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-rose-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Est. Discounts
                  </span>
                  <span className="font-mono font-bold">-${totalDiscounts.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Tax & Charges</span>
                  <span className="font-mono font-bold text-slate-700">
                    +${(Number(order.tax || 0) + Number(order.service_charge || 0)).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-800 pt-2 border-t border-slate-100">
                  <span>Est. Total Amount</span>
                  <span className="text-[#002B7F] font-mono">${estGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || order.items.length === 0}
                className="w-full py-3 bg-[#002B7F] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <span>{submitting ? "Creating Order..." : "Confirm & Create Order"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modifier Modal */}
      {showModifier && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Select Modifiers</h3>
                <p className="text-xs text-slate-400">
                  Customize option for {activeSelectedItemDetails?.name || "Item"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModifier(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {modalModifiers.length === 0 ? (
                <p className="text-xs text-center py-6 text-slate-400">
                  No modifiers available for this item.
                </p>
              ) : (
                modalModifiers.map((modifier) => {
                  const modQty = tempModifiers.find((m) => m.modifier_id === modifier.id)?.quantity || 0;

                  return (
                    <div
                      key={modifier.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-slate-700 block">{modifier.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          +${Number(modifier.price).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-xs">
                        <button
                          type="button"
                          onClick={() => decreaseModifier(modifier)}
                          disabled={modQty === 0}
                          className="w-5 h-5 text-slate-500 hover:text-red-500 flex items-center justify-center disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs w-4 text-center">{modQty}</span>
                        <button
                          type="button"
                          onClick={() => addModifier(modifier)}
                          className="w-5 h-5 text-slate-500 hover:text-emerald-500 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModifier(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveModifier}
                className="px-4 py-2 bg-[#002B7F] text-white rounded-xl font-bold text-xs hover:bg-blue-900 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Modifiers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerOrder;