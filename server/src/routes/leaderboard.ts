import { Router } from 'express';
import * as lc from '../controllers/leaderboardController';
import { authenticate } from '../middleware';

const router = Router();

router.get('/global', authenticate, lc.getGlobalLeaderboard);
router.get('/college', authenticate, lc.getCollegeLeaderboard);
router.get('/friends', authenticate, lc.getFriendsLeaderboard);

export default router;
