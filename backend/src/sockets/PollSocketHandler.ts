import { Server as SocketServer, Socket } from 'socket.io';
import * as PollService from '../services/PollService';
import ChatMessage from '../models/ChatMessage';

// This file only handles socket wiring — no business logic
const setupPollSocket = (io: SocketServer) => {
    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        const role = socket.handshake.query.role as string;

        // ─── Student: Register with name ──────────────────────────────────────────
        // Students emit this right after connecting so the server knows their name
        socket.on('student:register', (data: { name: string }) => {
            if (role !== 'student') return;
            PollService.addStudent(socket.id, data.name);
            // Broadcast updated participant list to everyone (teacher sees it in real-time)
            io.emit('students:updated', PollService.getConnectedStudents());
        });

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

                    const poll = await PollService.createPoll(
                        data.question,
                        data.options,
                        data.durationSeconds
                    );

                    const startedPoll = await PollService.startPoll(String(poll._id), io);

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

                    io.emit('poll:vote_updated', { poll: result.poll });
                } catch (error) {
                    console.error('poll:vote error:', error);
                    socket.emit('poll:vote_error', { message: 'Failed to record vote' });
                }
            }
        );

        // ─── Teacher: Kick a student ─────────────────────────────────────────────
        socket.on('student:kick', (data: { socketId: string }) => {
            // Notify the student they're kicked, then forcefully disconnect them
            io.to(data.socketId).emit('student:kicked');
            const targetSocket = io.sockets.sockets.get(data.socketId);
            if (targetSocket) {
                targetSocket.disconnect(true);
            } else {
                // Socket already gone — still clean up our map and notify others
                PollService.removeStudent(data.socketId);
                io.emit('students:updated', PollService.getConnectedStudents());
            }
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
            // Broadcast updated list so teacher sees the student leave in real-time
            io.emit('students:updated', PollService.getConnectedStudents());
        });
    });
};

export default setupPollSocket;
