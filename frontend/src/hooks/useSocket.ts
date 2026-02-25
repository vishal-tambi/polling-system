import { useEffect, useRef } from 'react';
import socket from '../lib/socket';

// useSocket connects/disconnects the socket and returns it
// The role query param is sent at connect time so the server knows who this is
const useSocket = (role: 'teacher' | 'student' | null) => {
    const isConnected = useRef(false);

    useEffect(() => {
        if (!role) return;

        // Only connect if not already connected
        if (!socket.connected) {
            socket.io.opts.query = { role };
            socket.connect();
        }
        isConnected.current = true;

        // No cleanup disconnect — socket is a module-level singleton and should
        // stay alive across route changes. It will disconnect naturally on tab close.
    }, [role]);

    return socket;
};

export default useSocket;
