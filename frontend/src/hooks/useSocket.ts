import { useEffect, useRef } from 'react';
import socket from '../lib/socket';

// useSocket connects/disconnects the socket and returns it.
// studentName is passed by students so the server can track their name.
const useSocket = (role: 'teacher' | 'student' | null, studentName?: string) => {
    const isConnected = useRef(false);

    useEffect(() => {
        if (!role) return;

        if (!socket.connected) {
            socket.io.opts.query = { role };
            socket.connect();
        }

        // Register student name with the server so the teacher's participants list shows it
        if (role === 'student' && studentName) {
            socket.emit('student:register', { name: studentName });
        }

        isConnected.current = true;

        // No cleanup disconnect — socket is a module-level singleton and should
        // stay alive across route changes. It will disconnect naturally on tab close.
    }, [role, studentName]);

    return socket;
};

export default useSocket;
