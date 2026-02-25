import { useEffect, useRef } from 'react';
import socket from '../lib/socket';

// useSocket connects/disconnects the socket and returns it
// The role query param is sent at connect time so the server knows who this is
const useSocket = (role: 'teacher' | 'student' | null) => {
    const isConnected = useRef(false);

    useEffect(() => {
        if (!role) return;

        // Set the role before connecting
        socket.io.opts.query = { role };

        socket.connect();
        isConnected.current = true;

        return () => {
            if (isConnected.current) {
                socket.disconnect();
                isConnected.current = false;
            }
        };
    }, [role]);

    return socket;
};

export default useSocket;
