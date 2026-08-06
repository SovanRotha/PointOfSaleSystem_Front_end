import React from "react";
import { Routes, Route } from "react-router-dom";
import CashierSidebar from "../Cashier/CashierSidebar";
import Order from "../Cashier/Order";
import Dashboard from "../Cashier/Dashboard";
import Payment from "../Cashier/Payment";
import CashierCreateOrder from "../Cashier/CreateOrder";

function CashierPage(){
    return(
        <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50">
            <CashierSidebar />
            <div  className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/order" element={<Order />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/createOrder" element={<CashierCreateOrder />} />
                </Routes>
            </div>
        </div>
    )
}
export default CashierPage;