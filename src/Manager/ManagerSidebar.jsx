import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  FileText,
  BookOpen,
  Box,
  Tag,
  BarChart2,
  Calendar,
  LogOut,
   ShoppingCart,
   Table,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ManagerSidebar() {
    const navigate = useNavigate();
  const menuItems = [
    {
      name: "Dashboard",
      path: "/manager",
      icon: <LayoutGrid size={22} />,
    },
    {
      name: "Live Orders",
      path: "/manager/live-order",
      icon: <FileText size={22} />,
    },
    { 
      name: "Orders",
      path : "/manager/order",
      icon: <FileText size={22} />,
    },
    {
      name: "Menu",
      path: "/manager/menu",
      icon: <BookOpen size={22} />,
    },
    {
      name: "Inventory",
      path: "/manager/inventory",
      icon: <Box size={22} />,
    },
    {
      name: "Tables",
      path: "/manager/table",
      icon: <Table size={22} />,
    },
    {
      name: "Discounts",
      path: "/manager/discount",
      icon: <Tag size={22} />,
    },
    // {
    //   name: "Reports",
    //   path: "/manager/reports",
    //   icon: <BarChart2 size={22} />,
    // },
    
  ];

  return (
    <aside className="w-full lg:w-64 lg:h-screen shrink-0 bg-[#F8FAFC] flex flex-col justify-between font-sans border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto">
      <div>
        {/* Header */}
        <div className="pt-8 pb-6 px-7">
          <h1 className="text-2xl font-bold text-[#002B7F]">POS Manager</h1>
          <p className="text-sm text-blue-500 font-medium mt-0.5">Shift Active</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/manager"}
              className={({ isActive }) =>
                `flex items-center gap-4 px-7 py-3.5 text-base font-semibold transition-colors duration-150 ${
                  isActive
                    ? "bg-[#DCE7FE] text-[#002B7F]"
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

       <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => navigate("/manager/createOrder")}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#002B7F]  text-white rounded-xl hover:bg-[#047163]  transition-all font-semibold"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Quick Order</span>
        </button>
      </div>


      {/* Logout */}
      <div className="p-4 mb-2">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default ManagerSidebar;