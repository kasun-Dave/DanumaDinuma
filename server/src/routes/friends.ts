import { Router } from 'express';
import * as fc from '../controllers/friendController';
import { authenticate, validate } from '../middleware';
import { friendRequestSchema, friendActionSchema } from '../validators';

const router = Router();

router.get('/', authenticate, fc.getFriends);
router.get('/search', authenticate, fc.searchUsers);
router.post('/request', authenticate, validate(friendRequestSchema), fc.sendFriendRequest);
router.post('/accept', authenticate, validate(friendActionSchema), fc.acceptFriendRequest);
router.post('/reject', authenticate, validate(friendActionSchema), fc.rejectFriendRequest);

export default router;
