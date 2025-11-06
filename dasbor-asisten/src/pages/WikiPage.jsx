// src/pages/WikiPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
// Gunakan 'react-markdown' untuk merender Markdown dengan aman
// Jalankan: npm install react-markdown
import ReactMarkdown from 'react-markdown';
import './WikiPage.css';

function WikiPage() {
    const [docList, setDocList] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDoc, setLoadingDoc] = useState(false);

    // Ambil daftar dokumen saat halaman dimuat
    useEffect(() => {
        const fetchDocList = async () => {
            setLoadingList(true);
            try {
                const res = await api.get('/wiki/documents');
                setDocList(res.data);
            } catch (error) {
                console.error("Gagal mengambil daftar wiki:", error);
            }
            setLoadingList(false);
        };
        fetchDocList();
    }, []);

    // Fungsi untuk memuat konten dokumen
    const loadDocument = async (docId) => {
        setLoadingDoc(true);
        setSelectedDoc(null);
        try {
            const res = await api.get(`/wiki/document/${docId}`);
            setSelectedDoc(res.data);
        } catch (error) {
            console.error("Gagal memuat dokumen:", error);
        }
        setLoadingDoc(false);
    };

    return (
        <div className="card">
            <h2>Wiki Internal (Should Have)</h2>
            <div className="wiki-container">
                {/* Sidebar Daftar Dokumen */}
                <aside className="wiki-sidebar">
                    <h4>Daftar Dokumen</h4>
                    {loadingList && <p>Memuat...</p>}
                    <ul>
                        {docList.map(doc => (
                            <li 
                                key={doc.id} 
                                onClick={() => loadDocument(doc.id)}
                                className={selectedDoc?.id === doc.id ? 'active' : ''}
                            >
                                {doc.title}
                            </li>
                        ))}
                    </ul>
                </aside>
                
                {/* Konten Dokumen */}
                <section className="wiki-content">
                    {loadingDoc && <p>Memuat dokumen...</p>}
                    {!selectedDoc && !loadingDoc && (
                        <p>Pilih dokumen dari sidebar untuk membacanya.</p>
                    )}
                    {selectedDoc && (
                        <>
                            <h3>{selectedDoc.title}</h3>
                            {/* Render konten Markdown */}
                            <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default WikiPage;