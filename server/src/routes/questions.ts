import { Router } from 'express';
import * as qc from '../controllers/questionController';
import { authenticate, authorize, validate } from '../middleware';
import { createQuestionSchema, updateQuestionSchema, createQuizSchema, submitQuizSchema } from '../validators';

const router = Router();

// Questions
router.get('/', authenticate, qc.getQuestions);
router.get('/subjects', authenticate, qc.getSubjectsAndTopics);
router.get('/:id', authenticate, qc.getQuestionById);
router.post('/', authenticate, authorize('admin'), validate(createQuestionSchema), qc.createQuestion);
router.put('/:id', authenticate, authorize('admin'), validate(updateQuestionSchema), qc.updateQuestion);
router.delete('/:id', authenticate, authorize('admin'), qc.deleteQuestion);

export default router;
