import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user, requiredRole }) {
    // If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If role is required and doesn't match, redirect to appropriate dashboard
    if (requiredRole && user.role !== requiredRole) {
        const redirectPath = user.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    // User is authenticated and has correct role
    return children;
}
