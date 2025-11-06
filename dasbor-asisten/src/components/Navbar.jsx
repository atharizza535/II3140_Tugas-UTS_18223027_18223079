// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // Kita akan buat file CSS terpisah untuk navbar

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login'); // Redirect ke login setelah logout
        } catch (error) {
            console.error('Gagal logout:', error);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">Dasbor Asisten</Link>
            <div className="nav-links">
                {currentUser && (
                    <>
                        <Link to="/">Dasbor</Link>
                        <Link to="/tasks">Tugas</Link>
                        <Link to="/lab">Virtual Lab</Link>
                        {/* <Link to="/wiki">Wiki</Link> (Untuk Fase 3) */}
                        {/* <Link to="/schedule">Jadwal</Link> (Untuk Fase 3) */}
                        <button onClick={handleLogout} className="nav-logout-btn">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;