import { Router } from 'express';
import * as bc from '../controllers/bookmarkController';
import { authenticate, validate } from '../middleware';
import { bookmarkSchema } from '../validators';

const router = Router();

router.get('/', authenticate, bc.getBookmarks);
router.post('/', authenticate, validate(bookmarkSchema), bc.createBookmark);
router.post('/toggle', authenticate, validate(bookmarkSchema), bc.toggleBookmark);
router.delete('/:id', authenticate, bc.deleteBookmark);

export default router;
