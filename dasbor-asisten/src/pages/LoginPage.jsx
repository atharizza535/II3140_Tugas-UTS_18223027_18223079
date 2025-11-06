// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Ambil lokasi asal (jika ada) untuk redirect setelah login
    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Gunakan Firebase Auth [sumber: 21]
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true }); // Redirect ke halaman asal
        } catch (err) {
            setError('Gagal login. Periksa kembali email dan password Anda.');
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Gunakan style 'card' dari index.css
        <div className="card" style={{ maxWidth: '450px', margin: '3rem auto' }}>
            <h2 style={{ textAlign: 'center' }}>Login Asisten</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Loading...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;