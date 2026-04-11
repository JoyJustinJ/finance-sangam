import React from 'react';
import { Navigate } from 'react-router-dom';

function isTokenValid(token) {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('fs_token');
    if (!isTokenValid(token)) {
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_user');
        return <Navigate to="/login" replace />;
    }
    return children;
}

export function AdminRoute({ children }) {
    const token = localStorage.getItem('fs_token');
    if (!isTokenValid(token)) {
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_user');
        return <Navigate to="/login" replace />;
    }
    try {
        const user = JSON.parse(localStorage.getItem('fs_user') || '{}');
        if (user.role !== 'admin') return <Navigate to="/" replace />;
    } catch {
        return <Navigate to="/" replace />;
    }
    return children;
}
