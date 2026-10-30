import { Response } from 'express';
import mongoose from 'mongoose';
import { Question, Quiz, Attempt } from '../models';
import { AuthRequest } from '../types';
import { calculateQuizXP, awardXP, updateStreak, checkAndAwardBadges } from '../services/gamification';

export const getQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, topic, subtopic, difficulty, search, page = '1', limit = '20', isPublished } = req.query;
    const filter: any = {};
    if (req.user?.role !== 'admin') { filter.isPublished = true; } 
    else if (isPublished !== undefined) { filter.isPublished = isPublished === 'true'; }
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (subtopic) filter.subtopic = subtopic;
    if (difficulty && difficulty !== 'mixed') filter.difficulty = difficulty;
    if (search) filter.$text = { $search: search as string };
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const [questions, total] = await Promise.all([
      Question.find(filter).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }),
      Question.countDocuments(filter),
    ]);
    res.json({ questions, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) { res.status(500).json({ message: 'Failed to get questions' }); }
};

export const getQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) { res.status(404).json({ message: 'Question not found' }); return; }
    res.json({ question });
  } catch (error) { res.status(500).json({ message: 'Failed to get question' }); }
};

export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ question });
  } catch (error) { res.status(500).json({ message: 'Failed to create question' }); }
};

export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) { res.status(404).json({ message: 'Question not found' }); return; }
    res.json({ question });
  } catch (error) { res.status(500).json({ message: 'Failed to update question' }); }
};

export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) { res.status(404).json({ message: 'Question not found' }); return; }
    res.json({ message: 'Question deleted' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete question' }); }
};

export const getSubjectsAndTopics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await Question.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$subject', topics: { $addToSet: '$topic' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ subjects });
  } catch (error) { res.status(500).json({ message: 'Failed to get subjects' }); }
};

export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, subject, topics, difficulty, questionCount, timeLimit, negativeMarking, negativeMarkValue } = req.body;
    const filter: any = { isPublished: true };
    if (subject) filter.subject = subject;
    if (topics && topics.length > 0) filter.topic = { $in: topics };
    if (difficulty && difficulty !== 'mixed') filter.difficulty = difficulty;
    const questions = await Question.aggregate([{ $match: filter }, { $sample: { size: questionCount } }]);
    if (questions.length === 0) { res.status(404).json({ message: 'No questions found matching criteria' }); return; }
    const quiz = await Quiz.create({
      userId: req.user?._id, type, subject: subject || '', topics: topics || [],
      difficulty: difficulty || 'mixed', questionIds: questions.map((q) => q._id),
      questionCount: questions.length, timeLimit: type === 'timed' ? (timeLimit || 30) : 0,
      negativeMarking: negativeMarking || false, negativeMarkValue: negativeMarkValue || 0.25, startedAt: new Date(),
    });
    res.status(201).json({ quiz: { ...quiz.toObject(), questions } });
  } catch (error) { res.status(500).json({ message: 'Failed to create quiz' }); }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user?._id;
    const quiz = await Quiz.findOne({ _id: quizId, userId });
    if (!quiz) { res.status(404).json({ message: 'Quiz not found' }); return; }
    if (quiz.status === 'completed') { res.status(400).json({ message: 'Quiz already submitted' }); return; }
    const questions = await Question.find({ _id: { $in: quiz.questionIds } });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
    let totalCorrect = 0, totalWrong = 0, totalSkipped = 0, score = 0;
    const attempts = [];
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;
      const isCorrect = answer.selectedOptionIndex === question.correctOptionIndex;
      const isSkipped = answer.selectedOptionIndex === -1;
      if (isCorrect) { totalCorrect++; score += 1; }
      else if (isSkipped) { totalSkipped++; }
      else { totalWrong++; if (quiz.negativeMarking) score -= quiz.negativeMarkValue; }
      attempts.push({ userId, quizId: quiz._id, questionId: answer.questionId,
        selectedOptionIndex: answer.selectedOptionIndex, isCorrect, timeTaken: answer.timeTaken || 0, xpEarned: isCorrect ? 10 : 0 });
    }
    await Attempt.insertMany(attempts);
    const xpEarned = calculateQuizXP(totalCorrect, (req.user as any)?.streak || 0, quiz.questionCount);
    quiz.status = 'completed'; quiz.score = Math.max(0, score);
    quiz.totalCorrect = totalCorrect; quiz.totalWrong = totalWrong;
    quiz.totalSkipped = totalSkipped; quiz.xpEarned = xpEarned; quiz.completedAt = new Date();
    await quiz.save();
    await awardXP(userId as string, xpEarned);
    await updateStreak(userId as string);
    const newBadges = await checkAndAwardBadges(userId as string);
    res.json({ result: { quizId: quiz._id, score: quiz.score, totalCorrect, totalWrong, totalSkipped,
      totalQuestions: quiz.questionCount, percentage: Math.round((totalCorrect / quiz.questionCount) * 100),
      xpEarned, newBadges, negativeMarking: quiz.negativeMarking } });
  } catch (error) { res.status(500).json({ message: 'Failed to submit quiz' }); }
};

export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user?._id }).populate('questionIds');
    if (!quiz) { res.status(404).json({ message: 'Quiz not found' }); return; }
    let attempts: any[] = [];
    if (quiz.status === 'completed') { attempts = await Attempt.find({ quizId: quiz._id }); }
    res.json({ quiz, attempts });
  } catch (error) { res.status(500).json({ message: 'Failed to get quiz' }); }
};

export const getUserQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const quizzes = await Quiz.find({ userId: req.user?._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Quiz.countDocuments({ userId: req.user?._id });
    res.json({ quizzes, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ message: 'Failed to get quizzes' }); }
};
