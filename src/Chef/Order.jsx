import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Clock,
  MapPin,
  User,
  ShoppingBag,
  Loader2,
  RefreshCw,
  CheckCircle2,
  ChefHat,
  ArrowRight,
  Flame,
  UtensilsCrossed,
  AlertCircle,
} from "lucide-react";

function Order({ onSelectOrderForPayment }) {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const response = await api.get("/api/orders/pending");
      const data = response.data?.data?.data || response.data?.data || [];
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch pending orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Optional status update handler (e.g. mark kitchen status as ready)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await api.patch(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });

      console.log(response.data);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (error) {
      console.error("Full Error:", error);
      console.error("Response:", error.response);
      console.error("Data:", error.response?.data);

      alert(JSON.stringify(error.response?.data));
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to calculate elapsed time in minutes
  const getElapsedMinutes = (createdAt) => {
    if (!createdAt) return 0;
    const diffMs = new Date() - new Date(createdAt);
    return Math.floor(diffMs / (1000 * 60));
  };

  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase() || "pending";
    switch (s) {
      case "pending":
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-600 animate-pulse" /> Pending
          </span>
        );
      case "preparing":
      case "in_progress":
        return (
          <span className="bg-blue-100 text-[#002B7F] border border-blue-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <ChefHat className="w-3 h-3 text-[#002B7F]" /> Preparing
          </span>
        );
      case "ready":
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 mb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#002B7F] rounded-2xl">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Live Kitchen Queue
              </h2>
              <p className="text-sm text-slate-500">
                Real-time active kitchen tickets and order status tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200/60">
            {orders.length} Active {orders.length === 1 ? "Ticket" : "Tickets"}
          </span>
          <button
            onClick={() => fetchOrders(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#002B7F]" />
          <p className="text-sm font-medium">Fetching kitchen tickets...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Kitchen Queue Clear!
          </h3>
          <p className="text-sm text-slate-500">
            All customer orders have been prepared and completed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
          {orders.map((order) => {
            const elapsed = getElapsedMinutes(order.created_at);
            const isDelayed = elapsed > 20;

            return (
              <div
                key={order.id}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Ticket
                      </span>
                      <h4 className="text-xl font-extrabold text-[#002B7F]">
                        #{order.order_number}
                      </h4>
                    </div>
                    {renderStatusBadge(order.status)}
                  </div>

                  {/* Metadata Bar */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-100 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.table?.name || "Takeout"}</span>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${
                        isDelayed ? "text-rose-600 font-bold" : "text-slate-500"
                      }`}
                    >
                      {isDelayed ? (
                        <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{elapsed} min ago</span>
                    </div>
                  </div>

                  {/* Item List Header */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3" /> Ordered Items
                    </span>
                    <span>Qty</span>
                  </div>

                  {/* Item List */}
                  <div className="space-y-2 mb-4 max-h-44 overflow-y-auto pr-1">
                    {(order.items || []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between text-xs bg-white p-2 rounded-lg border border-slate-100/80"
                      >
                        <div className="pr-2">
                          <p className="font-semibold text-slate-800 leading-snug">
                            {item.menu_item?.name || item.name || "Item"}
                          </p>
                          {item.notes && (
                            <p className="text-[10px] text-amber-600 font-medium italic mt-0.5">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-[#002B7F] bg-blue-50 px-2 py-0.5 rounded-md">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-200/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Server:</span>
                    <span className="text-slate-800 font-bold">
                      {order.user?.name || "Staff"}
                    </span>
                  </div>

                  {/* Primary Action Button */}
                  {onSelectOrderForPayment ? (
                    <button
                      onClick={() => onSelectOrderForPayment(order)}
                      className="w-full mt-1 py-2 bg-[#002B7F] hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      Process Payment <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "completed")}
                      disabled={updatingId === order.id}
                      className="w-full mt-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {updatingId === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Ready
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Order;
