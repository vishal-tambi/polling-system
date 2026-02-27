import Poll, { IPoll } from '../models/Poll';
import Vote from '../models/Vote';
import { Server as SocketServer } from 'socket.io';

// Maps socketId → student name so the teacher can see who's connected
const connectedStudents = new Map<string, string>();

export const addStudent = (socketId: string, name: string) => {
    connectedStudents.set(socketId, name);
};

export const removeStudent = (socketId: string) => {
    connectedStudents.delete(socketId);
};

export const getConnectedStudentCount = () => {
    return connectedStudents.size;
};

// Returns the full participant list for broadcasting to clients
export const getConnectedStudents = (): { socketId: string; name: string }[] => {
    return Array.from(connectedStudents.entries()).map(([socketId, name]) => ({ socketId, name }));
};

// Create a new poll (does NOT start the timer yet)
export const createPoll = async (
    question: string,
    options: { text: string; isCorrect: boolean }[],
    durationSeconds: number
): Promise<IPoll> => {
    const formattedOptions = options.map((opt) => ({
        text: opt.text,
        votes: 0,
        isCorrect: opt.isCorrect,
    }));

    const poll = new Poll({
        question,
        options: formattedOptions,
        durationSeconds,
        startedAt: null,
        status: 'waiting',
    });

    await poll.save();
    return poll;
};

// Start the poll timer — sets startedAt and status to 'active'
export const startPoll = async (
    pollId: string,
    io: SocketServer
): Promise<IPoll | null> => {
    const poll = await Poll.findByIdAndUpdate(
        pollId,
        { startedAt: new Date(), status: 'active' },
        { new: true }
    );

    if (!poll) return null;

    // Schedule automatic close when timer expires
    setTimeout(async () => {
        await closePoll(pollId, io);
    }, poll.durationSeconds * 1000);

    return poll;
};

// Close the poll (timer expired or manually)
export const closePoll = async (pollId: string, io: SocketServer) => {
    const poll = await Poll.findById(pollId);

    // Only close if still active (avoid double-close)
    if (!poll || poll.status !== 'active') return;

    poll.status = 'closed';
    await poll.save();

    // Tell all clients the poll is now closed
    io.emit('poll:closed', { poll });
};

// Get the currently active or waiting poll
export const getActivePoll = async () => {
    return await Poll.findOne({ status: { $in: ['waiting', 'active'] } }).sort({ createdAt: -1 });
};

// Get all closed polls (poll history)
export const getPollHistory = async () => {
    return await Poll.find({ status: 'closed' }).sort({ createdAt: -1 });
};

// Cast a vote for a student — returns false if they already voted
export const castVote = async (
    pollId: string,
    optionIndex: number,
    studentIdentifier: string
): Promise<{ success: boolean; message: string; poll?: IPoll }> => {
    try {
        // Check the poll is still active
        const poll = await Poll.findById(pollId);
        if (!poll) return { success: false, message: 'Poll not found' };
        if (poll.status !== 'active') return { success: false, message: 'Poll is not active' };

        // Check for valid option index
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return { success: false, message: 'Invalid option' };
        }

        // Save the vote — the unique index will throw if they already voted
        await Vote.create({ pollId, studentIdentifier, optionIndex });

        // Use atomic $inc with positional operator to reliably increment the vote
        // count in MongoDB. Direct mutation of subdocument arrays (poll.options[i].votes++)
        // is not detected as dirty by Mongoose and save() will skip writing it.
        const updatedPoll = await Poll.findOneAndUpdate(
            { _id: pollId, 'options': { $exists: true } },
            { $inc: { [`options.${optionIndex}.votes`]: 1 } },
            { new: true }
        );

        if (!updatedPoll) return { success: false, message: 'Failed to record vote' };

        return { success: true, message: 'Vote recorded', poll: updatedPoll };
    } catch (error: any) {
        // MongoDB duplicate key error code = 11000
        if (error.code === 11000) {
            return { success: false, message: 'You have already voted on this poll' };
        }
        throw error;
    }
};

// Check if the teacher can create a new poll
// Returns true only if there's no active/waiting poll
export const canCreatePoll = async (): Promise<boolean> => {
    const activePoll = await Poll.findOne({ status: { $in: ['waiting', 'active'] } });
    return activePoll === null;
};

// Get how many students have voted on a given poll
export const getVoteCount = async (pollId: string): Promise<number> => {
    return await Vote.countDocuments({ pollId });
};
