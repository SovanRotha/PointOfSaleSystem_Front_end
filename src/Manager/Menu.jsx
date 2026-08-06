import Category from "../ManagerComponent/Category";
import AddCategory from "../ManagerComponent/AddCategory";
import { Routes, Route } from "react-router-dom";
import EditCategory from "../ManagerComponent/EditCategory";
import MenuItem from "../ManagerComponent/MenuItem";
import AddMenuItem from "../ManagerComponent/AddMenuItem";
import EditMenuItem from "../ManagerComponent/EditMenuItem";
import Modifier from "../MenuComponent/Modifier";

function Menu(){
    return (
        <div>
            <Routes>
                <Route path="/" element={<Category/>} />
                <Route path="/addCategory" element={<AddCategory/>}/>
                <Route path="/editCategory/:id" element={<EditCategory/>} />
                <Route path="/menuItem/:id" element={<MenuItem/>} />
                <Route path="/addMenuItem" element={<AddMenuItem/>} />
                <Route path="/editMenuItem/:id" element={<EditMenuItem/>} />
                <Route path="/modifier" element={<Modifier/>} />
            </Routes>
           
        </div>
    )
}
export default Menu;