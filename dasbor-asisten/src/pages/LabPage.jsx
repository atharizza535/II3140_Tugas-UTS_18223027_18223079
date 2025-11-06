// src/pages/LabPage.jsx

import React, { useCallback, useState, useRef } from 'react';
import TerminalComponent from '../components/Terminal';
import api from '../services/api'; // Gunakan instance axios kita

function LabPage() {
    // === STATE BARU UNTUK KUIS ===
    // 'false' = mode terminal biasa. 'true' = sedang menjawab kuis.
    const [isInQuizMode, setIsInQuizMode] = useState(false);
    
    // Menyimpan array soal kuis dari API
    const [quizQuestions, setQuizQuestions] = useState([]);
    
    // Men-track kita di pertanyaan ke berapa
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    
    // Menyimpan instance terminal untuk fungsi helper
    const terminalRef = useRef(null); 
    
    // ID kuis yang akan diambil (sesuai yang Anda buat di Firestore)
    const QUIZ_ID_TO_FETCH = "9gxmCpIEzzNFJQjzXzGx"; // <-- GANTI INI DENGAN ID DOKUMEN ANDA

    // === Fungsi Helper untuk Kuis ===

    // Memulai kuis, dipanggil oleh perintah 'quiz'
    const startQuiz = async (term) => {
        terminalRef.current = term; // Simpan terminal
        term.writeln("Memulai kuis... Mengambil soal dari server...");

        try {
            const res = await api.get(`/lab/quiz/${QUIZ_ID_TO_FETCH}`);
            const questions = res.data.questions;

            if (!questions || questions.length === 0) {
                term.writeln("\x1b[31mError: Kuis tidak memiliki pertanyaan.\x1b[0m");
                return;
            }

            // Set state untuk memulai kuis
            setQuizQuestions(questions);
            setCurrentQuestionIndex(0);
            setIsInQuizMode(true);
            
            // Tampilkan pertanyaan pertama
            term.writeln("\nKuis Dimulai! Jawab pertanyaan di bawah ini.");
            term.writeln("Ketik 'quit' untuk keluar dari kuis.");
            term.writeln(`\nQ1: ${questions[0].question}`);
            term.write("Jawaban: ");

        } catch (error) {
            term.writeln(`\x1b[31mError mengambil kuis: ${error.message}\x1b[0m`);
        }
    };

    // Menangani jawaban kuis
    const handleQuizAnswer = (answer) => {
        const term = terminalRef.current;
        if (!term) return;

        // Cek jika user ingin keluar
        if (answer.toLowerCase() === 'quit') {
            term.writeln("\nKuis dibatalkan.");
            setIsInQuizMode(false);
            setQuizQuestions([]);
            return;
        }

        // Cek jawaban
        const correctAnswer = quizQuestions[currentQuestionIndex].answer;
        if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
            term.writeln("\n\x1b[32mBenar!\x1b[0m");
        } else {
            term.writeln(`\n\x1b[31mSalah.\x1b[0m Jawaban yang benar: ${correctAnswer}`);
        }

        // Pindah ke pertanyaan selanjutnya
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < quizQuestions.length) {
            // Masih ada soal
            setCurrentQuestionIndex(nextIndex);
            term.writeln(`\nQ${nextIndex + 1}: ${quizQuestions[nextIndex].question}`);
            term.write("Jawaban: ");
        } else {
            // Kuis selesai
            term.writeln("\n\n\x1b[33mKuis Selesai!\x1b[0m");
            term.writeln("Anda kembali ke mode terminal biasa.");
            setIsInQuizMode(false);
            setQuizQuestions([]);
        }
    };


    // === FUNGSI UTAMA HANDLER PERINTAH ===
    const handleCommand = useCallback(async (command, term) => {
        
        // 1. Cek dulu apakah kita sedang dalam mode Kuis
        if (isInQuizMode) {
            handleQuizAnswer(command); // 'command' adalah jawaban
            term.write("\n$ "); // Tampilkan prompt palsu setelah jawaban
            return;
        }

        // 2. Jika tidak, proses sebagai perintah terminal biasa
        const parts = command.trim().split(' ');
        const cmd = parts[0];
        // const arg = parts[1]; // Kita belum pakai arg

        switch (cmd) {
            case 'help':
                term.writeln('Perintah: help, ls, quiz, clear');
                break;

            case 'ls':
                term.writeln("Menghubungi server...");
                try {
                    const response = await api.get('/lab/files');
                    if (response.data && response.data.files) {
                        response.data.files.forEach(file => {
                            term.writeln(file.isDir ? `\x1b[34m${file.name}/\x1b[0m` : file.name);
                        });
                    }
                } catch (error) {
                    term.writeln(`\x1b[31mError: ${error.message}\x1b[0m`);
                }
                break;

            case 'quiz':
                // Memulai kuis!
                await startQuiz(term);
                break;

            case 'clear':
                term.clear();
                break;

            default:
                term.writeln(`\x1b[31mPerintah tidak dikenal: ${command}\x1b[0m`);
                break;
        }
    }, [isInQuizMode, quizQuestions, currentQuestionIndex]); // Tambahkan dependensi state

    return (
        <div className="card">
            <h2>Virtual Lab (Must Have)</h2>
            <p>Terminal ini terhubung ke backend. Coba ketik <strong>'ls'</strong> atau <strong>'quiz'</strong>.</p>
            <TerminalComponent 
                onCommand={handleCommand}
                welcomeMessage="Selamat datang di Virtual Lab v2.0 (React + Backend)"
            />
        </div>
    );
}

export default LabPage;