import { Server as SocketServer, Socket } from 'socket.io';
import * as PollService from '../services/PollService';
import ChatMessage from '../models/ChatMessage';

// This file only handles socket wiring — no business logic
const setupPollSocket = (io: SocketServer) => {
    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        // Client tells us their role when they connect
        const role = socket.handshake.query.role as string;

        if (role === 'student') {
            PollService.addStudent(socket.id);
        }

        // ─── Teacher: Create a new poll ───────────────────────────────────────────
        socket.on(
            'poll:create',
            async (data: {
                question: string;
                options: { text: string; isCorrect: boolean }[];
                durationSeconds: number;
            }) => {
                try {
                    const canCreate = await PollService.canCreatePoll();
                    if (!canCreate) {
                        socket.emit('poll:error', {
                            message: 'A poll is already active. Wait for it to finish.',
                        });
                        return;
                    }

                    // Create and immediately start the poll
                    const poll = await PollService.createPoll(
                        data.question,
                        data.options,
                        data.durationSeconds
                    );

                    const startedPoll = await PollService.startPoll(String(poll._id), io);

                    // Broadcast the new poll to everyone (teacher + all students)
                    io.emit('poll:started', {
                        poll: startedPoll,
                        serverTime: new Date().toISOString(),
                    });
                } catch (error) {
                    console.error('poll:create error:', error);
                    socket.emit('poll:error', { message: 'Failed to create poll' });
                }
            }
        );

        // ─── Student: Cast a vote ────────────────────────────────────────────────
        socket.on(
            'poll:vote',
            async (data: {
                pollId: string;
                optionIndex: number;
                studentIdentifier: string;
            }) => {
                try {
                    const result = await PollService.castVote(
                        data.pollId,
                        data.optionIndex,
                        data.studentIdentifier
                    );

                    if (!result.success) {
                        socket.emit('poll:vote_error', { message: result.message });
                        return;
                    }

                    // Broadcast updated vote counts to everyone
                    io.emit('poll:vote_updated', { poll: result.poll });
                } catch (error) {
                    console.error('poll:vote error:', error);
                    socket.emit('poll:vote_error', { message: 'Failed to record vote' });
                }
            }
        );

        // ─── Teacher: Kick a student ─────────────────────────────────────────────
        socket.on('student:kick', (data: { socketId: string }) => {
            io.to(data.socketId).emit('student:kicked');
        });

        // ─── Chat: Send a message ────────────────────────────────────────────────
        socket.on(
            'chat:send',
            async (data: { senderName: string; role: 'teacher' | 'student'; text: string }) => {
                try {
                    const message = await ChatMessage.create({
                        senderName: data.senderName,
                        role: data.role,
                        text: data.text,
                    });
                    // Broadcast to everyone
                    io.emit('chat:message', message);
                } catch (error) {
                    console.error('chat:send error:', error);
                }
            }
        );

        // ─── Disconnect ──────────────────────────────────────────────────────────
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            PollService.removeStudent(socket.id);
        });
    });
};

export default setupPollSocket;
