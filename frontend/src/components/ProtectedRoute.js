import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user, requiredRole }) {
    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole && user.role !== requiredRole) {
        const redirectPath = user.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard';
        return <Navigate to={redirectPath} replace />;
    }
    return children;
}
