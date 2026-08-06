import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import QRCode from "qrcode";
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
  QrCode as QrIcon,
} from "lucide-react";

function Payment() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Bakong Specific States
  const [bakongQR, setBakongQR] = useState(null);
  const [bakongQRSrc, setBakongQRSrc] = useState(null);
  const [bakongPaymentId, setBakongPaymentId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Fetch pending orders
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await api.get("/api/orders/pending");
        const data = response.data?.data?.data || response.data?.data || [];
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch pending orders", error);
      }  finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleShow = (order) => {
    setSelectedOrder(order);
    setPaymentMethod(order.payment_method || "cash");
    resetBakongState();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetBakongState();
  };

  const resetBakongState = () => {
    setBakongQR(null);
    setBakongQRSrc(null);
    setBakongPaymentId(null);
    setTimeLeft(300);
  };

  const handleProcessPayment = async () => {
    try {
      setIsProcessing(true);

      // Bakong Mobile Payment
      if (paymentMethod === "mobile_payment") {
        const response = await api.post("/api/payments/bakong", {
          order_id: selectedOrder.id,
        });

        const qrValue = response.data.qr;
        const paymentId = response.data.payment.id;

        setBakongQR(qrValue);
        setBakongPaymentId(paymentId);
        return;
      }

      // Normal payment (cash/card)
      await api.post("/api/payments", {
        order_id: selectedOrder.id,
        payment_method: paymentMethod,
        amount: selectedOrder.total,
      });

      alert("Payment completed successfully");
      setPayments((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      handleCloseModal();
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Convert QR string to Image Source Data URL & start countdown
  useEffect(() => {
    let countdownInterval;

    const buildQR = async () => {
      if (!bakongQR) {
        setBakongQRSrc(null);
        setTimeLeft(300);
        return;
      }

      let val = bakongQR;
      if (typeof val === "object") {
        val = val.data?.qr ?? val;
      }

      if (typeof val !== "string") {
        setBakongQRSrc(null);
        return;
      }

      if (val.startsWith("data:image")) {
        setBakongQRSrc(val);
      } else {
        const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(val) && val.length > 100;
        if (isBase64) {
          setBakongQRSrc(`data:image/png;base64,${val}`);
        } else {
          try {
            const dataUrl = await QRCode.toDataURL(val);
            setBakongQRSrc(dataUrl);
          } catch (err) {
            console.error("Failed to generate QR image", err);
            setBakongQRSrc(null);
          }
        }
      }

      setTimeLeft(300);
      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            resetBakongState();
            alert("QR code expired. Please request a new payment.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    buildQR();

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [bakongQR]);

  // 2. Poll Backend Status for Bakong Payment Verification
  useEffect(() => {
    let pollInterval;

    if (bakongPaymentId && bakongQRSrc) {
      pollInterval = setInterval(async () => {
        try {
          const response = await api.post("/api/payments/bakong/check", {
            payment_id: bakongPaymentId,
          });

          // Check for completed status from backend
          if (response.data?.status === "COMPLETED" || response.data?.payment?.status === "COMPLETED") {
            clearInterval(pollInterval);
            alert("Bakong Payment Successful!");
            
            // Remove order from state list
            setPayments((prev) => prev.filter((o) => o.id !== selectedOrder.id));
            handleCloseModal();
          }
        } catch (err) {
          console.error("Bakong verification check failed:", err);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [bakongPaymentId, bakongQRSrc, selectedOrder]);

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

      {/* Payment Processing Modal */}
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
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Show Bakong QR View when active */}
              {bakongQRSrc ? (
                <div className="flex flex-col items-center justify-center text-center py-2 space-y-4">
                  <div className="flex items-center gap-2 text-[#002B7F] font-bold">
                    <QrIcon className="w-5 h-5" />
                    <span>Scan with Bakong / Mobile App</span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
                    <img
                      src={bakongQRSrc}
                      className="w-56 h-56 object-contain mx-auto"
                      alt="Bakong KHQR"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Amount Due
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${Number(selectedOrder.total || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-amber-50 text-amber-800 px-4 py-2 rounded-xl border border-amber-200">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Waiting for payment verification...</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Expires in:{" "}
                    <span className="font-mono font-bold text-slate-700">
                      {Math.floor(timeLeft / 60)}:
                      {String(timeLeft % 60).padStart(2, "0")}
                    </span>
                  </p>

                  <button
                    onClick={resetBakongState}
                    className="text-xs text-slate-500 underline hover:text-slate-800 pt-2"
                  >
                    Cancel KHQR & Change Payment Method
                  </button>
                </div>
              ) : (
                /* Standard Payment View */
                <>
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
                  </div>

                  <hr className="border-slate-100" />

                  {/* Items List */}
                  <div>
                    <span className="text-[11px] font-bold text-[#002B7F] uppercase tracking-wider block mb-4">
                      ITEMIZED BILL
                    </span>

                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-3">
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
                              className="flex justify-between items-start text-sm"
                            >
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.quantity}x{" "}
                                  {item.menu_item?.name || item.name || "Item"}
                                </p>
                              </div>
                              <span className="font-semibold text-slate-800">
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
                          selectedOrder.subtotal || selectedOrder.total || 0
                        ).toFixed(2)}
                      </span>
                    </div>
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
                        { key: "credit_card", label: "Credit Card", icon: CreditCard },
                        { key: "debit_card", label: "Debit Card", icon: Wallet },
                        { key: "mobile_payment", label: "Mobile Pay (Bakong)", icon: Smartphone },
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
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? "text-[#002B7F]" : "text-slate-400"}`} />
                            {method.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            {!bakongQRSrc && (
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
                    className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 font-medium py-2 rounded-xl transition text-xs shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={() => alert("Receipt sent via email!")}
                    className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 font-medium py-2 rounded-xl transition text-xs shadow-sm"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;