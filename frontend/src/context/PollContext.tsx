import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Poll, ChatMessage, Role } from '../types/poll.types';
import api from '../lib/api';
import socket from '../lib/socket';
import { toast } from 'sonner';

interface PollContextType {
    role: Role;
    setRole: (role: Role) => void;
    studentName: string;
    setStudentName: (name: string) => void;
    studentId: string;
    activePoll: Poll | null;
    setActivePoll: (poll: Poll | null) => void;
    serverTimeOffset: number; // ms difference between server and client time
    hasVoted: boolean;
    setHasVoted: (voted: boolean) => void;
    selectedOptionIndex: number | null;
    setSelectedOptionIndex: (idx: number | null) => void;
    chatMessages: ChatMessage[];
    isChatOpen: boolean;
    setIsChatOpen: (open: boolean) => void;
    isKicked: boolean;
}

const PollContext = createContext<PollContextType | null>(null);

export const PollProvider = ({ children }: { children: React.ReactNode }) => {
    const [role, setRole] = useState<Role>(
        () => (sessionStorage.getItem('role') as Role) || null
    );
    const [studentName, setStudentName] = useState(
        () => sessionStorage.getItem('studentName') || ''
    );
    const [studentId] = useState(() => {
        // Stable per tab — used to prevent double voting
        let id = sessionStorage.getItem('studentId');
        if (!id) {
            id = `student-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            sessionStorage.setItem('studentId', id);
        }
        return id;
    });
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isKicked, setIsKicked] = useState(false);

    // Persist role and name to sessionStorage whenever they change
    useEffect(() => {
        if (role) sessionStorage.setItem('role', role);
    }, [role]);

    useEffect(() => {
        if (studentName) sessionStorage.setItem('studentName', studentName);
    }, [studentName]);

    // On mount: fetch active poll from server (resilience — handles refresh)
    useEffect(() => {
        const fetchActivePoll = async () => {
            try {
                const res = await api.get('/polls/active');
                const { poll, serverTime } = res.data;

                if (poll) {
                    setActivePoll(poll);

                    // Calculate offset between server clock and client clock
                    const offset = new Date(serverTime).getTime() - Date.now();
                    setServerTimeOffset(offset);
                }
            } catch (error) {
                // DB might be unreachable — don't crash
                console.warn('Could not fetch active poll:', error);
            }
        };

        fetchActivePoll();
    }, []);

    // Socket event listeners
    useEffect(() => {
        // A new poll was started by the teacher
        socket.on('poll:started', ({ poll, serverTime }: { poll: Poll; serverTime: string }) => {
            setActivePoll(poll);
            setHasVoted(false);
            setSelectedOptionIndex(null);
            const offset = new Date(serverTime).getTime() - Date.now();
            setServerTimeOffset(offset);
        });

        // Vote counts updated
        socket.on('poll:vote_updated', ({ poll }: { poll: Poll }) => {
            setActivePoll(poll);
        });

        // Poll ended (timer expired or all voted)
        socket.on('poll:closed', ({ poll }: { poll: Poll }) => {
            setActivePoll(poll);
        });

        // Student was kicked by teacher
        socket.on('student:kicked', () => {
            setIsKicked(true);
        });

        // New chat message received
        socket.on('chat:message', (message: ChatMessage) => {
            setChatMessages((prev) => [...prev, message]);
        });

        // Vote error (already voted, etc.)
        socket.on('poll:vote_error', ({ message }: { message: string }) => {
            toast.error(message);
        });

        // General poll errors
        socket.on('poll:error', ({ message }: { message: string }) => {
            toast.error(message);
        });

        return () => {
            socket.off('poll:started');
            socket.off('poll:vote_updated');
            socket.off('poll:closed');
            socket.off('student:kicked');
            socket.off('chat:message');
            socket.off('poll:vote_error');
            socket.off('poll:error');
        };
    }, []);

    return (
        <PollContext.Provider
            value={{
                role,
                setRole,
                studentName,
                setStudentName,
                studentId,
                activePoll,
                setActivePoll,
                serverTimeOffset,
                hasVoted,
                setHasVoted,
                selectedOptionIndex,
                setSelectedOptionIndex,
                chatMessages,
                isChatOpen,
                setIsChatOpen,
                isKicked,
            }}
        >
            {children}
        </PollContext.Provider>
    );
};

// Custom hook for consuming the context
export const usePoll = () => {
    const context = useContext(PollContext);
    if (!context) {
        throw new Error('usePoll must be used inside PollProvider');
    }
    return context;
};
