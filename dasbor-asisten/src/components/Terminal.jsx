// src/components/Terminal.jsx
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

// Komponen ini MENGONTROL terminal, tapi LOGIKA perintah datang dari props
function TerminalComponent({ onCommand, welcomeMessage = "Terminal siap." }) {
    const terminalRef = useRef(null); // Ref untuk div kontainer
    const termRef = useRef(null); // Ref untuk instance xterm
    const commandRef = useRef(''); // Ref untuk buffer perintah saat ini

    useEffect(() => {
        if (!terminalRef.current || termRef.current) {
            // Hanya inisialisasi sekali
            return;
        }

        // 1. Inisialisasi Terminal & Add-on
        const term = new Terminal({
            cursorBlink: true,
            theme: { background: '#1e1e1e', foreground: '#d4d4d4' }
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        // 2. Buka di Kontainer
        term.open(terminalRef.current);
        fitAddon.fit();
        
        // Simpan instance ke ref
        termRef.current = term;
        
        // 3. Tampilkan pesan selamat datang & prompt
        term.writeln(welcomeMessage);
        term.write('\r\n$ ');

        // 4. Pasang Key Listener
        term.onKey(({ key, domEvent }) => {
            if (domEvent.keyCode === 13) { // Enter
                if (commandRef.current.trim() !== '') {
                    term.writeln('');
                    // Panggil fungsi onCommand dari props dengan perintah
                    // Kita juga passing instance 'term' agar parent bisa menulis balasan
                    onCommand(commandRef.current.trim(), term);
                }
                commandRef.current = ''; // Reset buffer
                term.write('\r\n$ ');
            } else if (domEvent.keyCode === 8) { // Backspace
                if (commandRef.current.length > 0) {
                    term.write('\b \b');
                    commandRef.current = commandRef.current.slice(0, -1);
                }
            } else if (!domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey && (domEvent.key.length === 1 || domEvent.key === ' ')) {
                commandRef.current += key;
                term.write(key);
            }
        });

        // 5. Handle Resize
        const resizeListener = () => fitAddon.fit();
        window.addEventListener('resize', resizeListener);

        // 6. Cleanup saat komponen di-unmount
        return () => {
            window.removeEventListener('resize', resizeListener);
            term.dispose(); // Hancurkan instance xterm
            termRef.current = null;
        };

    }, [onCommand, welcomeMessage]); // Deps array

    // Kontainer harus punya tinggi/lebar agar 'fitAddon' berfungsi
    return (
        <div 
            ref={terminalRef} 
            style={{ width: '100%', height: '500px', background: '#1e1e1e' }}
        ></div>
    );
}

export default TerminalComponent;