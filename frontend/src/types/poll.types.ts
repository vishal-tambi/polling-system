// Shared TypeScript types used across frontend and backend events

export interface PollOption {
    text: string;
    votes: number;
    isCorrect: boolean;
}

export interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    durationSeconds: number;
    startedAt: string | null;
    status: 'waiting' | 'active' | 'closed';
    createdAt: string;
}

export interface ChatMessage {
    _id: string;
    senderName: string;
    role: 'teacher' | 'student';
    text: string;
    createdAt: string;
}

export type Role = 'teacher' | 'student' | null;

export interface Participant {
    socketId: string;
    name: string;
}
