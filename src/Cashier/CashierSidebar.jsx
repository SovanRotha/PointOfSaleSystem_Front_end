import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  FileText,
  CreditCard,
  ShoppingCart,
  LogOut,
} from "lucide-react";

function CashierSidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/cashier",
      icon: <LayoutGrid size={20} />,
    },
    {
      name: "Orders",
      path: "/cashier/order",
      icon: <FileText size={20} />,
    },
    {
      name: "Payment",
      path: "/cashier/payment",
      icon: <CreditCard size={20} />,
    },
  ];

  return (
    <aside className="w-full lg:w-64 lg:h-screen shrink-0 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between font-sans select-none overflow-y-auto">
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="p-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#002B7F] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              P
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                POS Cashier
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  Shift Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/cashier"}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#002B7F]/10 text-[#002B7F] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#002B7F] before:rounded-r-full"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 space-y-2 border-t border-slate-200/60 bg-slate-50/50">
        {/* Quick Order Primary CTA */}
        <button
          onClick={() => navigate("/cashier/createOrder")}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#002B7F] text-white rounded-xl font-semibold text-sm shadow-md shadow-[#002B7F]/20 hover:bg-[#002163] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Quick Order</span>
        </button>

        {/* Logout */}
        <button 
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/80 transition-colors duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default CashierSidebar;