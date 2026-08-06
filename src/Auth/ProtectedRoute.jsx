import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({
    children,
    permission = null,
    role = null,
    allowedRole = null,
    allowedRoles = [],
}) {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const requiredRoles = [role, allowedRole, ...allowedRoles].filter(Boolean);

    if (requiredRoles.length > 0) {
        const userRoles = [
            ...(user.roles || []).map((r) => (typeof r === "string" ? r : r.name)),
            user.role,
        ].filter(Boolean);

        const hasRole = userRoles.some((r) => requiredRoles.includes(r));

        if (!hasRole) {
            return <Navigate to="/403" replace />;
        }
    }

    if (permission) {
        const permissions =
            user.roles?.flatMap((roleItem) =>
                roleItem.permissions?.map((p) => p.name) || []
            ) || [];

        if (!permissions.includes(permission)) {
            return <Navigate to="/403" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;