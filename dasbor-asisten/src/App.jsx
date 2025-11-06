// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Impor Halaman
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import LabPage from './pages/LabPage';
// Impor halaman Fase 3 nanti...
// import WikiPage from './pages/WikiPage';
// import SchedulePage from './pages/SchedulePage';

function App() {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                <Routes>
                    {/* Rute Publik */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Rute Privat (Dilindungi) */}
                    <Route 
                        path="/" 
                        element={<PrivateRoute><DashboardPage /></PrivateRoute>} 
                    />
                    <Route 
                        path="/tasks" 
                        element={<PrivateRoute><TasksPage /></PrivateRoute>} 
                    />
                    <Route 
                        path="/lab" 
                        element={<PrivateRoute><LabPage /></PrivateRoute>} 
                    />
                    {/* <Route path="/wiki" element={<PrivateRoute><WikiPage /></PrivateRoute>} /> */}
                    {/* <Route path="/schedule" element={<PrivateRoute><SchedulePage /></PrivateRoute>} /> */}

                    {/* Rute 'Catch-all' (jika halaman tidak ditemukan) */}
                    <Route path="*" element={<h2>404: Halaman Tidak Ditemukan</h2>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;