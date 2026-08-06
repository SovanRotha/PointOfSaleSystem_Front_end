import Dashboard from "../Manager/Dashboard";
import { Routes, Route } from "react-router-dom";
import Discount from "../Manager/Discount";
import Inventory from "../Manager/Inventory";
import LiveOrder from "../Manager/LiveOrder";
import Menu from "../Manager/Menu";
import Payment from "../ManagerComponent/Payment";
import CreateOrder from "../ManagerComponent/CreateOrder";
import Order from "../Manager/Order";
import ManagerSidebar from "../Manager/ManagerSidebar";
import AddInventory from "../ManagerComponent/AddInventory";
import EditInventory from "../ManagerComponent/EditInventory";
import EditDiscount from "../ManagerComponent/EditDiscount";
import AddDiscount from "../ManagerComponent/AddDiscount";
import Table from "../Manager/Table";
import AddTable from "../ManagerComponent/AddTable";
import EditTable from "../ManagerComponent/EditTable";


function ManagerPage(){
    return(
        <div className="flex min-h-screen flex-col lg:flex-row bg-[#F8FAFC]">
           <ManagerSidebar/>
           <div className = "flex-1 min-w-0 p-3 sm:p-4 lg:p-6">
                <Routes>
                    <Route path={"/"} element ={<Dashboard/>}/>
                    <Route path={"/discount"} element = {<Discount/>}/>
                    <Route path={"/addDiscount"} element = {<AddDiscount/>}/>
                    <Route path={"/editDiscount/:id"} element = {<EditDiscount/>}/>

                    <Route path={"/inventory"} element ={<Inventory/>} />
                    <Route path={"/addinventory"} element = {<AddInventory/>}/>
                    <Route path={"/editinventory/:id"} element = {<EditInventory/>}/>

                    <Route path={"/live-order/*"} element = {<LiveOrder/>} />
                    <Route path={"/createOrder"} element={<CreateOrder/>} />
                    <Route path={"/order"} element={<Order/>} />

                    <Route path={"/table"} element={<Table/>} />
                    <Route path={"/addTable"} element={<AddTable/>} />
                    <Route path={"/editTable/:id"} element={<EditTable/>} />
                    
                    <Route path={"/menu/*"} element = {<Menu/>}/>

                    <Route path={"/payment"} element ={<Payment/>} />
                </Routes>
           </div>
        </div>
    )
}
export default ManagerPage;