// src/services/api.js
import axios from 'axios';

// Ganti dengan URL backend Anda setelah di-deploy
// (misal: Cloud Function, AWS Lambda, VM) [sumber: 23]
const API_BASE_URL = '/.netlify/functions/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// (Opsional) Kita bisa menambahkan interceptor untuk menyisipkan
// token auth di setiap request secara otomatis
api.interceptors.request.use(async (config) => {
    // const userToken = auth.currentUser?.getIdToken(); // Contoh
    // if (userToken) {
    //     config.headers.Authorization = `Bearer ${userToken}`;
    // }
    return config;
});

export default api;