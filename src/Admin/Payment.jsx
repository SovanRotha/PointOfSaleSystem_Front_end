import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  X,
  Banknote,
  CreditCard,
  Wallet,
  Smartphone,
  Printer,
  Mail,
  ArrowRight,
  Receipt,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

function Payment() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Track selected payment method
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await api.get("/api/orders/pending");
        // Adjust based on your actual API response structure
        const data = response.data?.data?.data || response.data?.data || [];
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch pending orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleShow = (order) => {
    setSelectedOrder(order);
    setPaymentMethod(order.payment_method || "cash");
    setShowModal(true);
  };

  const handleProcessPayment = async () => {
    try {
      setIsProcessing(true);

      const response = await api.post("/api/payments", {
        order_id: selectedOrder.id,
        payment_method: paymentMethod,
        amount: selectedOrder.total,
      });

      console.log(response.data);

      alert(
        `Payment for Order #${selectedOrder.order_number} completed successfully!`,
      );

      // Remove paid order from pending list
      setPayments((prev) =>
        prev.filter((order) => order.id !== selectedOrder.id),
      );

      setShowModal(false);
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Failed to process payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase() || "pending";
    if (s === "pending") {
      return (
        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
          Pending
        </span>
      );
    }
    return (
      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#002B7F] flex items-center gap-3">
            <Receipt className="w-8 h-8" />
            Pending Payments
          </h1>
          <p className="text-slate-500 mt-1">
            Review open orders and process customer payments.
          </p>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#002B7F]" />
          <p>Loading pending orders...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            All Caught Up!
          </h2>
          <p className="text-slate-500">
            There are no pending orders to process right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {payments.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Order
                  </p>
                  <p className="text-xl font-bold text-[#002B7F]">
                    #{order.order_number}
                  </p>
                </div>
                {renderStatusBadge(order.status)}
              </div>

              {/* Card Body */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {order.table?.name || "No Table (Takeout)"}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {order.created_at
                    ? new Date(order.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Time N/A"}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Total Due
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${Number(order.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleShow(order)}
                className="w-full py-2.5 bg-[#002B7F] text-white rounded-xl font-semibold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-sm"
              >
                Process Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Order Details
                </h2>
                <p className="text-sm font-semibold text-[#002B7F]">
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
                <span className="text-[11px] font-bold text-[#002B7F] uppercase tracking-wider block mb-4">
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
                  <span className="text-[#002B7F]">
                    ${Number(selectedOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Payment Method Selector */}
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-3">
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
                    const isSelected = paymentMethod === method.key;
                    return (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setPaymentMethod(method.key)}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-blue-50 border-[#002B7F] text-[#002B7F] shadow-sm ring-1 ring-[#002B7F]"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${isSelected ? "text-[#002B7F]" : "text-slate-400"}`}
                        />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3">
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="w-full bg-[#002B7F] hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Confirm & Pay $
                    {Number(selectedOrder.total || 0).toFixed(2)}
                  </>
                )}
              </button>

              <div className="flex gap-3">
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
        </div>
      )}
    </div>
  );
}

export default Payment;
