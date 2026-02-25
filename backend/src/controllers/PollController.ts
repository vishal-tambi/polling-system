import { Request, Response } from 'express';
import * as PollService from '../services/PollService';

// GET /api/polls/active
// Returns the currently active or waiting poll + server time (for timer sync)
export const getActivePoll = async (req: Request, res: Response) => {
    try {
        const poll = await PollService.getActivePoll();
        res.json({ poll, serverTime: new Date().toISOString() });
    } catch (error) {
        console.error('getActivePoll error:', error);
        res.status(500).json({ message: 'Failed to fetch active poll' });
    }
};

// GET /api/polls/history
// Returns all closed polls
export const getPollHistory = async (req: Request, res: Response) => {
    try {
        const polls = await PollService.getPollHistory();
        res.json({ polls });
    } catch (error) {
        console.error('getPollHistory error:', error);
        res.status(500).json({ message: 'Failed to fetch poll history' });
    }
};
