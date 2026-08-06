import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api ,  { AUTH_ENDPOINTS } from "../api/axios";
import {
  LayoutGrid,
  IdCard,
  Utensils,
  Package,
  BarChart3,
  Receipt,
  Settings,
  LogOut,
  CreditCard,
  Table,
  TableCellsMerge,
  TicketPercent,
  ShoppingCart
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, path: "/admin" },
  { id: "staff", label: "Staff", icon: IdCard, path: "/admin/staff" },
  { id: "menu", label: "Menu", icon: Utensils, path: "/admin/menu" },
  { id: "orders", label: "Orders", icon: Receipt, path: "/admin/order" },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    path: "/admin/inventory",
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    path: "/admin/payment",
  },
  {
    id: "paymentLogs",
    label: "Payment Record",
    icon: CreditCard,
    path: "/admin/paymentLog",
  },
  {
    id: "tables",
    label: "Tables",
    icon: TableCellsMerge,
    path: "/admin/table",
  },
  {
    id: "discounts",
    label: "Discounts",
    icon: TicketPercent,
    path: "/admin/discount",
  },
  // { id: "reports", label: "Reports", icon: BarChart3, path: "/admin/report" },
];

export default function AdminSidebar({ onLogout  }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  

const handleLogout = async () => {
  try {
    await api.post(AUTH_ENDPOINTS.logout);
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    // Clear any client-side data if you store it
    localStorage.clear();
    sessionStorage.clear();
    

    // Redirect to login
    navigate("/", { replace: true });
  }
};

  React.useEffect(() => {
    const currentPath = location.pathname.replace("/admin/", "");
    const matchedItem = navItems.find(
      (item) => item.path === location.pathname,
    );
    if (matchedItem) {
      setActiveTab(matchedItem.id);
    } else if (currentPath) {
      const fallback = navItems.find((item) => item.id === currentPath);
      if (fallback) {
        setActiveTab(fallback.id);
      }
    }
  }, [location.pathname]);

  

  return (
    <aside className="w-full lg:w-64 lg:h-screen shrink-0 bg-[#F8FAFC] border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between select-none overflow-y-auto">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-6 mb-2">
          <div className="w-12 h-12 bg-[#002B7F] rounded-2xl flex items-center justify-center text-white shadow-sm">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#002B7F] leading-tight">
              BistroOS
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Franchise Admin
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(item.path);
                }}
                className={`relative flex items-center gap-4 px-6 py-3.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#DCE7FE] text-[#002B7F]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#002B7F]" />
                )}

                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[#002B7F]" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => navigate("/admin/createOrder")}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#002B7F] text-white rounded-xl hover:bg-[#001F5C] transition-all font-semibold"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Quick Order</span>
        </button>
      </div>

      {/* Bottom Logout Button */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
