// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        // Jika belum login, redirect ke halaman /login
        // 'replace' mengganti histori, jadi tombol back tidak kembali ke halaman privat
        // 'state' menyimpan lokasi asal, agar bisa kembali setelah login
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Jika sudah login, tampilkan halaman yang diminta
    return children;
}

export default PrivateRoute;