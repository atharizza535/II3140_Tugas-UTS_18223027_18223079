// script.js

// Jalankan skrip setelah DOM (struktur halaman) selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inisialisasi Terminal (xterm.js)
    const term = new Terminal({
        cursorBlink: true,
        fontFamily: 'Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',
        fontSize: 14,
        theme: {
            background: '#1e1e1e', // Latar belakang terminal
            foreground: '#d4d4d4', // Teks default
            cursor: '#00aaff',      // Warna kursor
            selection: 'rgba(50, 50, 50, 0.5)'
        }
    });

    // 2. Inisialisasi Add-on 'Fit' untuk Responsivitas
    // Ini membuat terminal pas dengan ukuran kontainernya
    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);

    // 3. Tampilkan Terminal di Halaman
    const termContainer = document.getElementById('terminal-container');
    term.open(termContainer);

    // 4. Panggil fit() agar terminal mengisi kontainer
    fitAddon.fit();
    // Panggil fit() lagi jika ukuran window berubah (agar responsif)
    window.addEventListener('resize', () => fitAddon.fit());

    // 5. Sistem File Virtual (Dummy)
    // Ini adalah 'database' client-side kita
    const virtualFilesystem = {
        '/': {
            'README.md': "Selamat datang di Virtual Lab!\nIni adalah proyek untuk Tugas 1.",
            'about.txt': "Dibuat menggunakan xterm.js.",
            'docs': {
                'guide.txt': "Perintah yang tersedia: help, ls, cat, clear."
            }
        }
    };

    // 6. State Terminal
    let currentDirectory = '/';
    let currentCommand = '';

    // 7. Fungsi Helper untuk Prompt
    function writePrompt() {
        currentCommand = ''; // Reset buffer perintah
        term.write('\r\n\x1b[36m' + `user@vlab:${currentDirectory}` + '\x1b[0m $ '); // Prompt berwarna
    }

    // 8. Logika Inti: Menangani Input Pengguna
    term.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

        if (domEvent.keyCode === 13) { // Tombol Enter
            if (currentCommand.trim() !== '') {
                term.writeln(''); // Pindah baris
                processCommand(currentCommand.trim());
            }
            writePrompt();
        } else if (domEvent.keyCode === 8) { // Tombol Backspace
            if (currentCommand.length > 0) {
                term.write('\b \b'); // Mundur, hapus karakter, mundur lagi
                currentCommand = currentCommand.slice(0, -1);
            }
        } else if (printable && key.length === 1) { // Karakter yang bisa dicetak
            currentCommand += key;
            term.write(key); // Tampilkan karakter yang diketik
        }
    });

    // 9. Fungsi Pemroses Perintah
    function processCommand(command) {
        const parts = command.split(' ').filter(Boolean); // Pecah perintah, cth: "cat README.md"
        const cmd = parts[0];
        const arg = parts[1];

        switch (cmd) {
            case 'help':
                term.writeln('Perintah yang tersedia:');
                term.writeln('  help     - Menampilkan bantuan ini');
                term.writeln('  ls       - Menampilkan isi direktori saat ini');
                term.writeln('  cat [file] - Menampilkan isi file');
                term.writeln('  clear    - Membersihkan layar terminal');
                break;

            case 'ls':
                const items = Object.keys(virtualFilesystem[currentDirectory]);
                items.forEach(item => {
                    const isDir = typeof virtualFilesystem[currentDirectory][item] === 'object';
                    // Tampilkan direktori dengan warna biru
                    term.writeln(isDir ? `\x1b[34m${item}/\x1b[0m` : item);
                });
                break;

            case 'cat':
                if (!arg) {
                    term.writeln('Penggunaan: cat [namafile]');
                    break;
                }
                const fileContent = virtualFilesystem[currentDirectory][arg];
                if (fileContent && typeof fileContent === 'string') {
                    // Ganti newline \n dengan \r\n agar terminal menampilkannya dengan benar
                    term.writeln(fileContent.replace(/\n/g, '\r\n'));
                } else if (typeof fileContent === 'object') {
                    term.writeln(`Error: '${arg}' adalah sebuah direktori.`);
                } else {
                    term.writeln(`Error: File '${arg}' tidak ditemukan.`);
                }
                break;

            case 'clear':
                term.clear(); // Perintah bawaan xterm.js
                break;

            default:
                term.writeln(`Perintah tidak dikenal: ${command}`);
                break;
        }
    }

    // Tampilkan pesan selamat datang dan prompt pertama
    term.writeln('Terminal Virtual Lab v1.0');
    writePrompt();
});