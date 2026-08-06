
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Logout(){

    const { logout } = useContext(AuthContext);

    const navigate = useNavigate();


    const handleLogout = async () => {

        await logout();

        navigate("/login");

    };


    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            Logout
        </button>
    );
}

export default Logout;