import AdminSidebar from "../Admin/AdminSidebar";
import { Routes, Route} from "react-router-dom";
import Dashboard from "../Admin/Dashboard";
import Staff from "../Admin/Staff";
import Inventory from "../Admin/Inventory";
import Menu from "../Admin/Menu";
import Order from "../Admin/Order";
import Report from "../Admin/Report";
import Setting from "../Admin/Setting";
import AddUser from "../AdminComponent/AddUser";
import EditUser from "../AdminComponent/EditUser";
import AddInventory from "../AdminComponent/AddInventory";
import EditInventory from "../AdminComponent/EditInventory";
import Payment from "../Admin/Payment";
import Table from "../Admin/Table";
import EditOrder from "../AdminComponent/EditOrder";
import CreateOrder from "../AdminComponent/CreateOrder";
import AddTable from "../AdminComponent/AddTable";
import EditTable from "../AdminComponent/EditTable";
import PaymentLog from "../Admin/PaymentLog";
import Discount from "../Admin/Discount";
import AddDiscount from "../AdminComponent/AddDiscount";
import EditDiscount from "../AdminComponent/EditDiscount";

function AdminPage(){
    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
            <AdminSidebar/>
            <div className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6">
                <Routes>
                    <Route path={"/"} element={<Dashboard/>} />

                    <Route path={"/addUser"} element={<AddUser/>}/>
                    <Route path={"/editUser/:id"} element={<EditUser/>}/>
                    <Route path={"/staff"} element={<Staff/>} />

                    <Route path={"/inventory"} element={<Inventory/>} />
                    <Route path={"/addinventory"} element={<AddInventory/>} />
                    <Route path={"/editinventory/:id"} element={<EditInventory/>} />

                    <Route path={"/payment"} element={<Payment/>} />
                    <Route path={"/menu/*"} element={<Menu/>} />

                    <Route path={"/table"} element={<Table/>} />
                    <Route path={"/addTable"} element={<AddTable/>} />
                    <Route path={"/editTable/:id"} element={<EditTable/>} />
                    
                    <Route path={"/order"} element={<Order/>}/>
                    <Route path={"/createOrder"} element={<CreateOrder/>}/>
                    <Route path={"/editorder/:id"} element={<EditOrder/>} />

                    <Route path={"/paymentLog"} element={<PaymentLog/>}/>

                    <Route path={"/discount"} element={<Discount/>} />
                    <Route path={"/addDiscount"} element={<AddDiscount/>} />
                    <Route path={"/editDiscount/:id"} element={<EditDiscount/>} />

                    <Route path={"/report"} element={<Report/>}/>
                    <Route path={"/setting"} element={<Setting/>}/>
                </Routes>
            </div>
        </div>
    )
}
export default AdminPage;