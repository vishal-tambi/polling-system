import express from 'express';
import { getActivePoll, getPollHistory } from '../controllers/PollController';

const router = express.Router();

// GET /api/polls/active — client calls this on page load/refresh
router.get('/active', getActivePoll);

// GET /api/polls/history — teacher's poll history view
router.get('/history', getPollHistory);

export default router;
