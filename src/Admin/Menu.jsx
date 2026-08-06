import Category from "../MenuComponent/Category";
import AddCategory from "../AdminComponent/AddCategory";
import { Routes, Route } from "react-router-dom";
import EditCategory from "../AdminComponent/EditCategory";
import MenuItem from "../MenuComponent/MenuItem";
import AddMenuItem from "../AdminComponent/AddMenuItem";
import EditMenuItem from "../AdminComponent/EditMenuItem";
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