import Login from "./Auth/Login";
import AdminPage from "./Pages/Admin";
import { Route, Routes } from "react-router-dom";
import ManagerPage from "./Pages/Manager";
import CashierPage from "./Pages/Cashier";
import ChefPage from "./Pages/Chef";
import ProtectedRoute from "./Auth/ProtectedRoute";
import WaiterPage from "./Pages/Waiter";
import EmployeePage from "./Pages/Employee";
import CustomerPage from "./Pages/Customer";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/403" element={<div className="min-h-screen flex items-center justify-center">You are not allow to access to Page</div>} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute allowedRole="manager">
              <ManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/*"
          element={
            <ProtectedRoute allowedRole="cashier">
              <CashierPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chef/*"
          element={
            <ProtectedRoute allowedRole="chef">
              <ChefPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/*"
          element={
            <ProtectedRoute allowedRole="waiter">
              <WaiterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute allowedRole="customer">
              <CustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
