import { useNavigate, useLocation } from "react-router-dom";
import { Grid, ShoppingBag } from "lucide-react";

function WaiterSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Tables", path: "/waiter", icon: Grid },
    { label: "Orders", path: "/waiter/order", icon: ShoppingBag },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-2 pt-2 sm:px-4 sm:pb-3">
      <nav className="mx-auto flex max-w-lg items-center justify-around gap-1 rounded-[24px] border border-slate-200 bg-white/95 p-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/waiter"
              ? location.pathname === "/waiter" || location.pathname === "/waiter/"
              : location.pathname.startsWith("/waiter/order");

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex-1 rounded-[18px] px-2 py-2 text-[10px] font-semibold transition-all sm:px-3 sm:py-2.5 sm:text-xs ${
                isActive
                  ? "bg-[#002B7F] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default WaiterSidebar;