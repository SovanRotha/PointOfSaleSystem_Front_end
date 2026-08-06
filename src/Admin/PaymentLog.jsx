import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  History,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Banknote,
  Wallet,
  Smartphone,
  User,
  Receipt,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Printer,
  Utensils,
} from "lucide-react";

function PaymentLog() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("all");

  // Receipt Modal States
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/payments");
      const data = response.data?.data?.data || response.data?.data || [];
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payment log:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full order details including line items when opening a receipt.
  // There's no single-order endpoint, so we pull the full orders list and
  // match the one we need by id.
  const handleOpenReceipt = async (payment) => {
    setSelectedPayment(payment);
    const orderId = payment.order_id || payment.order?.id;

    if (!orderId) {
      setOrderDetails(payment.order || null);
      return;
    }

    try {
      setFetchingOrder(true);
      const response = await api.get("/api/orders");
      // Unpack response according to API structure (data.data.data, data.data, or data)
      const ordersList =
        response.data?.data?.data || response.data?.data || response.data || [];
      const matchedOrder = ordersList.find((o) => o.id === orderId);
      setOrderDetails(matchedOrder || payment.order || null);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      // Fallback to order embedded in payment if the list fetch fails
      setOrderDetails(payment.order || null);
    } finally {
      setFetchingOrder(false);
    }
  };

  const handleCloseReceipt = () => {
    setSelectedPayment(null);
    setOrderDetails(null);
  };

  // Helper to render icons and styling for payment methods
  const renderMethodBadge = (method) => {
    const m = method?.toLowerCase() || "";
    let Icon = Banknote;
    let label = method || "Cash";
    let colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";

    if (m.includes("credit")) {
      Icon = CreditCard;
      label = "Credit Card";
      colorClass = "bg-[#002B7F]/10 text-[#002B7F] border-blue-200";
    } else if (m.includes("debit")) {
      Icon = Wallet;
      label = "Debit Card";
      colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
    } else if (m.includes("mobile") || m.includes("qr")) {
      Icon = Smartphone;
      label = "Mobile Pay";
      colorClass = "bg-purple-50 text-purple-700 border-purple-200";
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colorClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{label}</span>
      </span>
    );
  };

  // Filtered payments based on search query & method select
  const filteredPayments = payments.filter((item) => {
    const matchesOrder = item.order?.order_number
      ?.toString()
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesUser = item.paid_by?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMethod =
      selectedMethod === "all" ||
      item.payment_method?.toLowerCase() === selectedMethod.toLowerCase();

    return (matchesOrder || matchesUser) && matchesMethod;
  });

  // KPI Calculations
  const totalRevenue = payments.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );
  const avgTransaction = payments.length ? totalRevenue / payments.length : 0;

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#002B7F] flex items-center gap-3">
            <History className="w-8 h-8" />
            Payment History
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Detailed ledger of all processed transactions and customer receipts.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#002B7F] rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {payments.length} orders
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg. Ticket Size
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              ${avgTransaction.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filters Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order # or Cashier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B7F] transition shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002B7F] transition cursor-pointer shadow-sm w-full sm:w-auto"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="mobile_payment">Mobile Pay</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#002B7F]" />
            <p className="text-sm font-semibold">Loading payment ledger...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold text-slate-600">
              No payment logs found
            </p>
            <p className="text-xs mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Change</th>
                  <th className="py-4 px-6">Paid By</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                    onClick={() => handleOpenReceipt(payment)}
                  >
                    <td className="py-4 px-6">
                      <span className="font-bold text-[#002B7F] bg-blue-50/60 px-2.5 py-1 rounded-lg border border-blue-100 text-xs">
                        #
                        {payment.order?.order_number ||
                          `ORD-${payment.order_id}`}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {renderMethodBadge(payment.payment_method)}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      ${Number(payment.amount || 0).toFixed(2)}
                    </td>

                    <td className="py-4 px-6 text-slate-500 font-medium">
                      ${Number(payment.change_amount || 0).toFixed(2)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-700 font-medium text-xs">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {payment.paid_by?.name || "N/A"}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {payment.status || "Completed"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReceipt(payment);
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-[#002B7F] transition underline"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing <strong>{filteredPayments.length}</strong> of{" "}
            <strong>{payments.length}</strong> payments
          </p>
          <div className="flex gap-2">
            <button
              disabled
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-400 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-400 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Receipt Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#002B7F] p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <span className="text-xs text-blue-200 font-bold uppercase tracking-wider">
                  Official Receipt
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  #
                  {selectedPayment.order?.order_number ||
                    `ORD-${selectedPayment.order_id}`}
                </h3>
              </div>
              <button
                onClick={handleCloseReceipt}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {fetchingOrder ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#002B7F] mb-2" />
                  <p className="text-xs font-semibold">
                    Fetching full order details...
                  </p>
                </div>
              ) : (
                <>
                  {/* Meta Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 uppercase font-semibold block mb-0.5">
                        Order Type
                      </span>
                      <p className="font-bold text-slate-800 capitalize flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-slate-400" />
                        {orderDetails?.type?.replace("_", " ") || "Dine In"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-semibold block mb-0.5">
                        Table
                      </span>
                      <p className="font-bold text-slate-800">
                        {orderDetails?.table?.name ||
                          (orderDetails?.table_id
                            ? `Table #${orderDetails.table_id}`
                            : "Takeout / No Table")}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-semibold block mb-0.5">
                        Cashier
                      </span>
                      <p className="font-bold text-slate-800">
                        {selectedPayment.paid_by?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-semibold block mb-0.5">
                        Date & Time
                      </span>
                      <p className="text-slate-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {selectedPayment.created_at
                          ? new Date(selectedPayment.created_at).toLocaleString(
                              [],
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Itemized Order Items with Modifiers & Subtotals */}
                  {orderDetails?.items && orderDetails.items.length > 0 ? (
                    <div>
                      <span className="text-[11px] font-bold text-[#002B7F] uppercase tracking-wider block mb-3">
                        PURCHASED ITEMS
                      </span>

                      <div className="space-y-3">
                        {orderDetails.items.map((item) => {
                          const unitPrice = Number(item.unit_price || item.price || 0);
                          const itemQuantity = Number(item.quantity || 1);
                          const baseItemTotal = unitPrice * itemQuantity;

                          // Total modifiers cost for this item
                          const modifiersTotal = (item.modifiers || []).reduce(
                            (sum, mod) => {
                              const modPrice = Number(mod.price || mod.modifier?.price || 0);
                              const modQty = Number(mod.quantity || 1);
                              return sum + modPrice * modQty;
                            },
                            0
                          );

                          const combinedItemTotal = baseItemTotal + modifiersTotal;

                          return (
                            <div
                              key={item.id}
                              className="border-b border-slate-100 pb-3 text-xs space-y-1.5"
                            >
                              {/* Item Name, Price & Total */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">
                                    {itemQuantity}x{" "}
                                    {item.menu_item?.name || item.name || "Menu Item"}
                                  </p>
                                  <p className="text-slate-400 font-medium text-[11px]">
                                    ${unitPrice.toFixed(2)} each
                                  </p>
                                </div>
                                <span className="font-bold text-slate-800 text-sm">
                                  ${combinedItemTotal.toFixed(2)}
                                </span>
                              </div>

                              {/* Modifiers breakdown block */}
                              {item.modifiers && item.modifiers.length > 0 && (
                                <div className="ml-3 pl-2.5 border-l-2 border-blue-200 bg-slate-50/70 p-2 rounded-r-xl space-y-1">
                                  {item.modifiers.map((mod) => {
                                    const modPrice = Number(
                                      mod.price || mod.modifier?.price || 0
                                    );
                                    const modQty = Number(mod.quantity || 1);
                                    const modSubtotal = modPrice * modQty;

                                    return (
                                      <div
                                        key={mod.id}
                                        className="flex justify-between items-center text-[11px] text-slate-600 font-medium"
                                      >
                                        <span className="flex items-center gap-1">
                                          <span className="text-blue-500 font-bold">+</span>
                                          {mod.modifier?.name || mod.name || "Extra"}
                                          {modQty > 1 && ` (x${modQty})`}
                                        </span>
                                        <span className="text-slate-500 font-semibold">
                                          +${modSubtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  })}

                                  {/* Subtotal row specifically for modifiers */}
                                  <div className="flex justify-between items-center text-[10px] text-blue-900 font-bold pt-1 border-t border-slate-200/60 mt-1">
                                    <span>Modifiers Subtotal:</span>
                                    <span>+${modifiersTotal.toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic text-center py-2">
                      No item details available for this order.
                    </p>
                  )}

                  {/* Calculation Totals */}
                  {orderDetails && (
                    <div className="space-y-2 text-xs pt-2">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-700">
                          ${Number(orderDetails.sub_total || orderDetails.total || 0).toFixed(2)}
                        </span>
                      </div>

                      {Number(orderDetails.service_charge || 0) > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>
                            Service Charge{" "}
                            {orderDetails.service_charge_percent
                              ? `(${orderDetails.service_charge_percent}%)`
                              : ""}
                          </span>
                          <span className="font-medium text-slate-700">
                            ${Number(orderDetails.service_charge).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {Number(orderDetails.tax || 0) > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>
                            Tax{" "}
                            {orderDetails.tax_percent
                              ? `(${orderDetails.tax_percent}%)`
                              : ""}
                          </span>
                          <span className="font-medium text-slate-700">
                            ${Number(orderDetails.tax).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {Number(orderDetails.discount || 0) > 0 && (
                        <div className="flex justify-between text-rose-500 font-medium">
                          <span>Discounts</span>
                          <span>-${Number(orderDetails.discount).toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total</span>
                        <span className="text-[#002B7F]">
                          ${Number(orderDetails.total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Payment Breakdown Card */}
                  <div className="space-y-2 text-xs bg-blue-50/50 p-4 rounded-2xl border border-blue-100/60">
                    <span className="text-[11px] font-bold text-[#002B7F] uppercase tracking-wider block mb-2">
                      PAYMENT BREAKDOWN
                    </span>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Method</span>
                      <div>
                        {renderMethodBadge(selectedPayment.payment_method)}
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-600 pt-1">
                      <span>Tendered</span>
                      <span className="font-bold text-slate-900">
                        ${Number(selectedPayment.amount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Change</span>
                      <span className="font-bold text-slate-900">
                        ${Number(selectedPayment.change_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 shrink-0">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold rounded-xl transition text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentLog;