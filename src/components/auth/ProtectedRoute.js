import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return _jsx("div", { children: "Loading..." });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    if (requireAdmin && (!user || !user.isAdmin)) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
