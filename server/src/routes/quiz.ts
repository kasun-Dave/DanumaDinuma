import { Router } from 'express';
import * as qc from '../controllers/questionController';
import { authenticate, validate } from '../middleware';
import { createQuizSchema, submitQuizSchema } from '../validators';

const router = Router();

router.post('/create', authenticate, validate(createQuizSchema), qc.createQuiz);
router.post('/submit', authenticate, validate(submitQuizSchema), qc.submitQuiz);
router.get('/history', authenticate, qc.getUserQuizzes);
router.get('/:id', authenticate, qc.getQuizById);

export default router;
