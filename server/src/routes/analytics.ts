import { Router } from 'express';
import * as ac from '../controllers/analyticsController';
import { authenticate } from '../middleware';

const router = Router();

router.get('/dashboard', authenticate, ac.getDashboard);
router.get('/detailed', authenticate, ac.getAnalytics);
router.get('/weak-topics', authenticate, ac.getWeakTopicsEndpoint);

export default router;
