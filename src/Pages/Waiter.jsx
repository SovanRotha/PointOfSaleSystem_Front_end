import React from "react";
import { Routes, Route } from "react-router-dom";

import Order from "../Waiter/Order";
import Table from "../Waiter/Table";
import WaiterSidebar from "../Waiter/WaiterSidebar";


function WaiterPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-100">
      <div className="flex-1 pb-24 sm:pb-28 lg:pb-8">
        <Routes>
          <Route path="/order/*" element={<Order />} />
          <Route path="/" element={<Table />} />
        </Routes>
      </div>

      <WaiterSidebar />
    </div>
  );
}

export default WaiterPage;
