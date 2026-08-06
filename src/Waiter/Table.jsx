import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { RefreshCcw, Users, MapPin, Clock3, Sparkles } from "lucide-react";

function Table() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setRefreshing(true);
      const response = await api.get("/api/tables");
      const payload = response?.data?.data ?? response?.data ?? [];
      setTables(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to fetch tables", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/api/tables/${id}/status`, { status });
      setTables((prev) =>
        prev.map((table) => (table.id === id ? { ...table, status } : table))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update table status.");
    }
  };

  const locations = useMemo(() => {
    const uniqueLocations = ["All"];
    tables.forEach((table) => {
      const location = table.location?.trim();
      if (location && !uniqueLocations.includes(location)) {
        uniqueLocations.push(location);
      }
    });
    return uniqueLocations.length > 1 ? uniqueLocations : ["All", "Main Floor", "Patio", "Bar Area"];
  }, [tables]);

  const statusOptions = ["All", "available", "occupied", "reserved"];

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesLocation =
        activeLocation === "All" || table.location?.toLowerCase().trim() === activeLocation.toLowerCase().trim();
      const statusValue = (table.status || "available").toLowerCase();
      const matchesStatus = activeStatus === "All" || statusValue === activeStatus;
      return matchesLocation && matchesStatus;
    });
  }, [activeLocation, activeStatus, tables]);

  const summary = useMemo(() => {
    const occupied = tables.filter((table) => (table.status || "available").toLowerCase() === "occupied").length;
    const reserved = tables.filter((table) => (table.status || "available").toLowerCase() === "reserved").length;
    const available = tables.filter((table) => (table.status || "available").toLowerCase() === "available").length;
    return { occupied, reserved, available, total: tables.length };
  }, [tables]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fbff,_#f1f5f9_60%,_#e2e8f0)] p-3 sm:p-4 md:p-6 lg:p-8 text-slate-800">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <header className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#002B7F]/10 bg-[#002B7F]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#002B7F]">
                <Sparkles className="h-3.5 w-3.5" />
                Live floor overview
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, waiter
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Keep the dining room moving smoothly by checking table status, assigning orders, and serving guests faster.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTables}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh floor
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "Occupied", value: summary.occupied, tone: "text-rose-600" },
              { label: "Reserved", value: summary.reserved, tone: "text-amber-600" },
              { label: "Available", value: summary.available, tone: "text-emerald-600" },
              { label: "Total tables", value: summary.total, tone: "text-[#002B7F]" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className={`mt-1 text-2xl font-black ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setActiveLocation(loc)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeLocation === loc
                      ? "bg-[#002B7F] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(status)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                    activeStatus === status
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
              ))
            ) : filteredTables.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                No tables match the current filters. Try changing the section or status view.
              </div>
            ) : (
              filteredTables.map((table) => {
                const statusValue = (table.status || "available").toLowerCase();
                const isOccupied = statusValue === "occupied";
                const isReserved = statusValue === "reserved";
                const statusClass = isOccupied
                  ? "bg-rose-500/10 text-rose-600 border-rose-200"
                  : isReserved
                    ? "bg-amber-500/10 text-amber-600 border-amber-200"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-200";

                return (
                  <div
                    key={table.id}
                    className={`rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      isOccupied
                        ? "border-rose-200 bg-rose-50"
                        : isReserved
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                          {table.location || "Main Floor"}
                        </p>
                        <h2 className="mt-1 text-xl font-black text-slate-900">
                          {table.name || `Table ${table.id}`}
                        </h2>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${statusClass}`}>
                        {statusValue}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      <span>Capacity {table.capacity || 4}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      <span>{table.location || "Main Floor"}</span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-slate-500">
                          <Clock3 className="h-4 w-4" />
                          Ready for service
                        </span>
                        <select
                          value={statusValue}
                          onChange={(event) => handleStatusChange(table.id, event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 outline-none"
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/waiter/order?tableId=${table.id}`)}
                        className="inline-flex items-center justify-center rounded-2xl bg-[#002B7F] px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
                      >
                        Open order
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Table;
