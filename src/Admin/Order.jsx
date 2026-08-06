import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  Printer,
  Mail,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Wallet,
  TrendingUp,
} from "lucide-react";

function Order() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/orders");
        setOrders(response.data.data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, []);

  // Summary Metrics Calculations
  const totalSales = orders.reduce(
    (acc, order) => acc + Number(order.total || 0),
    0,
  );
  const totalOrdersCount = orders.length;
  const avgCheck = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?",
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/orders/${id}`);
      setOrders((prev) => prev.filter((order) => order.id !== id));
      alert("Order deleted successfully");
    } catch (error) {
      console.log("Failed to delete order", error);
    }
  };

  // Helper to select/change payment method in state
  const handleSelectPaymentMethod = (method) => {
    setSelectedOrder((prev) => ({
      ...prev,
      payment_method: method,
    }));
  };

  // Helper function to color-code status badges
  const renderStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "pending";

    const statusStyles = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      served: "bg-indigo-50 text-indigo-700 border-indigo-200",
      paid: "bg-teal-50 text-teal-700 border-teal-200",
      voided: "bg-rose-50 text-rose-700 border-rose-200",
      cancelled: "bg-slate-100 text-slate-600 border-slate-200",
    };

    const style =
      statusStyles[statusLower] ||
      "bg-slate-100 text-slate-700 border-slate-200";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
      >
        {statusLower.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order History</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and review all past transactions across your bistro
            franchise.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/createOrder")}
          className="flex items-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* STATS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-w-xl">
        {/* Total Sales Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            TOTAL SALES
          </span>
          <div className="mt-2">
            <h2 className="text-2xl font-extrabold text-[#002B7F]">
              ${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% from yesterday</span>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            TOTAL ORDERS
          </span>
          <div className="mt-2">
            <h2 className="text-2xl font-extrabold text-[#002B7F]">
              {totalOrdersCount}
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-2">
              Avg. ${avgCheck.toFixed(2)} / check
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-4 px-6">Date/Time</th>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Table #</th>
                <th className="py-4 px-6">Server Name</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-6 text-slate-500">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="py-4 px-6 font-semibold text-indigo-600">
                    #{order.order_number}
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {order.table?.name || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {order.server_name || "N/A"}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    ${Number(order.total || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    {renderStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/editorder/${order.id}`)}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Order"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CENTER POP-UP RECEIPT MODAL */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Order Details
                </h2>
                <p className="text-sm font-semibold text-indigo-600">
                  #{selectedOrder.order_number}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                    Table
                  </span>
                  <p className="text-slate-800 font-bold text-sm">
                    {selectedOrder.table?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                    Server
                  </span>
                  <p className="text-slate-800 font-bold text-sm">
                    {selectedOrder.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                    Opened
                  </span>
                  <p className="text-slate-700 font-semibold">
                    {selectedOrder.created_at
                      ? new Date(selectedOrder.created_at).toLocaleTimeString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                    Status
                  </span>
                  <div>{renderStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Items List */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                  ITEMIZED BILL
                </span>

                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => {
                      const basePrice =
                        Number(item.price) ||
                        Number(item.menu_item?.selling_price) ||
                        0;
                      const totalItemPrice =
                        basePrice * Number(item.quantity || 1);

                      return (
                        <div
                          key={item.id}
                          className="flex justify-between items-start text-sm leading-snug"
                        >
                          <div className="pr-4">
                            <p className="font-semibold text-slate-800 text-[15px]">
                              {item.quantity}x{" "}
                              {item.menu_item?.name || item.name || "Item"}
                            </p>

                            {(item.modifier ||
                              item.modifiers ||
                              item.notes) && (
                              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                                {typeof item.modifier === "string"
                                  ? item.modifier
                                  : Array.isArray(item.modifiers)
                                    ? item.modifiers
                                        .map((mod) => {
                                          const name =
                                            mod?.modifier?.name ||
                                            mod?.label ||
                                            "Extra";
                                          const price =
                                            mod?.price || mod?.modifier?.price;
                                          const qty = mod?.quantity
                                            ? `x${mod.quantity}`
                                            : "";

                                          return price
                                            ? `${name} (+$${Number(price).toFixed(2)}) ${qty}`.trim()
                                            : `${name} ${qty}`.trim();
                                        })
                                        .join(", ")
                                    : typeof item.notes === "string"
                                      ? item.notes
                                      : ""}
                              </p>
                            )}
                          </div>

                          <span className="font-semibold text-slate-800 text-[15px] pt-0.5">
                            ${totalItemPrice.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    No items available
                  </p>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Calculation Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>
                    $
                    {Number(
                      selectedOrder.subtotal || selectedOrder.total || 0,
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>
                    Service Charge{" "}
                    {selectedOrder.service_charge_percent
                      ? `(${selectedOrder.service_charge_percent}%)`
                      : ""}
                  </span>
                  <span>
                    ${Number(selectedOrder.service_charge || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>
                    Tax{" "}
                    {selectedOrder.tax_percent
                      ? `(${selectedOrder.tax_percent}%)`
                      : ""}
                  </span>
                  <span>${Number(selectedOrder.tax || 0).toFixed(2)}</span>
                </div>

                {Number(selectedOrder.discount || 0) > 0 && (
                  <div className="flex justify-between text-rose-500 font-medium">
                    <span>Discounts</span>
                    <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-indigo-600">
                    ${Number(selectedOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Payment Buttons */}
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                  Select Payment Method
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "cash", label: "Cash", icon: Banknote },
                    {
                      key: "credit_card",
                      label: "Credit Card",
                      icon: CreditCard,
                    },
                    { key: "debit_card", label: "Debit Card", icon: Wallet },
                    {
                      key: "mobile_payment",
                      label: "Mobile Pay",
                      icon: Smartphone,
                    },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected =
                      selectedOrder.payment_method === method.key;
                    return (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => handleSelectPaymentMethod(method.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`}
                        />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-xl transition text-xs shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => alert("Receipt sent via email!")}
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 rounded-xl transition text-xs shadow-sm"
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Order;