import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.userType)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;