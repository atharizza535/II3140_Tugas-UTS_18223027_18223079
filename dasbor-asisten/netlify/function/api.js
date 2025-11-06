const serverless = require("serverless-http");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");


let serviceAccount;
// Cek jika kita punya environment variable (ini akan ada di Netlify)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Jika tidak, kita pakai file lokal (untuk 'npm run dev')
    serviceAccount = require("./serviceAccountKey.json");
}

// 2. Inisialisasi Firebase Admin (Hanya jika belum ada)
if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://dasbor-asisten.firebaseio.com" 
    });
}


// 3. 'db' sekarang memiliki akses admin penuh ke database live
const db = admin.firestore();

// 4. Buat Aplikasi Express
const app = express();

// ... sisa file ...

// 3. Gunakan CORS (PENTING! agar React bisa memanggil API ini)
app.use(cors({ origin: true }));

// 4. Aktifkan JSON parser bawaan Express
app.use(express.json());

// --- MULAI ENDPOINT API ---

/**
 * ENDPOINT: GET /api/tasks
 * Deskripsi: Mengambil semua tugas.
 * Dipakai oleh: Halaman TasksPage.jsx saat dimuat.
 */
app.get("/tasks", async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").get();
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * ENDPOINT: POST /api/tasks
 * Deskripsi: Membuat tugas baru.
 * Dipakai oleh: Tombol "Tambah Tugas" di TasksPage.jsx.
 */
app.post("/tasks", async (req, res) => {
  try {
    const { title, status } = req.body;
    if (!title || !status) {
      return res.status(400).send("Data tidak lengkap (membutuhkan title dan status).");
    }

    const newTask = { title, status };
    const docRef = await db.collection("tasks").add(newTask);
    
    // Kirim kembali data baru beserta ID yang digenerate
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * ENDPOINT: GET /api/announcements
 * Deskripsi: Mengambil semua pengumuman.
 * Dipakai oleh: Halaman DashboardPage.jsx saat dimuat.
 */
app.get("/announcements", async (req, res) => {
  try {
    // Kita akan hardcode datanya agar mudah
    const dummyAnnouncements = [
      {
        id: "a1",
        title: "Selamat Datang di Dasbor Asisten!",
        content: "Ini adalah pengumuman pertama Anda yang diambil dari API.",
        createdAt: new Date().toISOString()
      }
    ];
    res.status(200).json(dummyAnnouncements);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * ENDPOINT: GET /api/lab/files
 * Deskripsi: Mengambil data 'ls' dari database live.
 * Dipakai oleh: Perintah 'ls' di LabPage.jsx.
 */
app.get("/lab/files", async (req, res) => {
  try {
    // Ambil dokumen 'root' dari koleksi 'lab-files'
    const docRef = db.collection("lab-files").doc("root");
    const docSnap = await docRef.get();

    if (!docSnap.exists()) {
      return res.status(404).send("Data 'ls' tidak ditemukan di database.");
    }
    
    // Kirim kembali data (termasuk array 'files')
    res.status(200).json(docSnap.data());

  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * ENDPOINT: PUT /api/tasks/:taskId
 * Deskripsi: Mengupdate status tugas (misal: dari 'To-Do' ke 'In-Progress').
 * Dipakai oleh: Fungsi onDragEnd di TasksPage.jsx.
 */
app.put("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // Ambil status baru dari body

    if (!status) {
      return res.status(400).send("Membutuhkan 'status' baru.");
    }
    
    // Temukan dokumen di Firestore dan update
    const taskRef = db.collection("tasks").doc(taskId);
    await taskRef.update({ status: status });

    res.status(200).json({ id: taskId, message: "Status berhasil diupdate" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * ENDPOINT: GET /api/lab/quiz/:quizId
 * Deskripsi: Mengambil satu set soal kuis dari Firestore.
 * Dipakai oleh: Perintah 'quiz' di LabPage.jsx.
 */
app.get("/lab/quiz/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const docRef = db.collection("quizzes").doc(quizId);
    const docSnap = await docRef.get();

    if (!docSnap.exists()) {
      return res.status(404).send("Kuis tidak ditemukan.");
    }

    // Kirim kembali data kuis (termasuk array 'questions')
    res.status(200).json(docSnap.data());
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// --- AKHIR ENDPOINT API ---

// 5. Ekspor aplikasi Express sebagai Cloud Function bernama 'api'
module.exports.handler = serverless(app);