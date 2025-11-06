// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css'; // CSS Kustom

function DashboardPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth(); // Dapatkan info user yang login

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                // Panggil endpoint backend /announcements
                const response = await api.get('/announcements');
                // Pastikan data yang masuk adalah array, jika tidak, gunakan array kosong
                setAnnouncements(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Gagal mengambil pengumuman:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []); // [] = Jalankan sekali saat halaman dimuat

    return (
        <div>
            {/* Sapa pengguna */}
            {currentUser && <h1>Selamat datang, {currentUser.displayName || currentUser.email}!</h1>}
            
            <div className="card">
                <h2>Papan Pengumuman (Must Have)</h2>
                {loading && <p>Memuat pengumuman...</p>}
                
                {!loading && announcements.length === 0 && (
                    <p>Tidak ada pengumuman saat ini.</p>
                )}
                
                {!loading && (
                    <ul className="announcement-list">
                        {announcements.map(item => (
                            <li key={item.id} className="announcement-item">
                                <h3>{item.title}</h3>
                                <p>{item.content}</p>
                                <small>Diposting: {new Date(item.createdAt).toLocaleString()}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* Nanti bisa ditambahkan ringkasan tugas di sini */}
        </div>
    );
}

export default DashboardPage;