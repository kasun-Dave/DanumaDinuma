import { Response } from 'express';
import mongoose from 'mongoose';
import { Quiz, Attempt, Bookmark, User, Question } from '../models';
import { AuthRequest } from '../types';
import { getWeakTopics } from '../services/gamification';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userObjectId = new mongoose.Types.ObjectId(userId as string);
    const [totalAttempts, totalCorrect, quizCount, bookmarkCount, recentQuizzes, user] = await Promise.all([
      Attempt.countDocuments({ userId: userObjectId }),
      Attempt.countDocuments({ userId: userObjectId, isCorrect: true }),
      Quiz.countDocuments({ userId: userObjectId, status: 'completed' }),
      Bookmark.countDocuments({ userId: userObjectId }),
      Quiz.find({ userId: userObjectId, status: 'completed' }).sort({ completedAt: -1 }).limit(5).lean(),
      User.findById(userId).populate('badges').lean(),
    ]);
    const avgScore = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const weakTopics = await getWeakTopics(userId as string);

    // Get leaderboard rank
    const rank = await User.countDocuments({ xp: { $gt: user?.xp || 0 } }) + 1;

    res.json({
      dashboard: {
        totalAttempts, averageScore: avgScore, quizzesCompleted: quizCount,
        xp: user?.xp || 0, streak: user?.streak || 0, longestStreak: user?.longestStreak || 0,
        bookmarkCount, leaderboardRank: rank, weakTopics,
        recentQuizzes, badges: user?.badges || [],
      },
    });
  } catch (error) { console.error('Dashboard error:', error); res.status(500).json({ message: 'Failed to load dashboard' }); }
};

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?._id as string);

    // Topic-wise accuracy
    const topicAccuracy = await Attempt.aggregate([
      { $match: { userId } },
      { $lookup: { from: 'questions', localField: 'questionId', foreignField: '_id', as: 'question' } },
      { $unwind: '$question' },
      { $group: { _id: { subject: '$question.subject', topic: '$question.topic' },
        total: { $sum: 1 }, correct: { $sum: { $cond: ['$isCorrect', 1, 0] } } } },
      { $project: { subject: '$_id.subject', topic: '$_id.topic',
        accuracy: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] },
        total: 1, correct: 1 } },
      { $sort: { accuracy: 1 } },
    ]);

    // Score history (last 30 quizzes)
    const scoreHistory = await Quiz.find({ userId, status: 'completed' })
      .sort({ completedAt: -1 }).limit(30)
      .select('score totalCorrect questionCount completedAt subject').lean();

    // Daily attempt trends (last 30 days)
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const attemptTrends = await Attempt.aggregate([
      { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        attempts: { $sum: 1 }, correct: { $sum: { $cond: ['$isCorrect', 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    const weakTopics = await getWeakTopics(req.user?._id as string);

    res.json({ analytics: { topicAccuracy, scoreHistory: scoreHistory.reverse(), attemptTrends, weakTopics } });
  } catch (error) { res.status(500).json({ message: 'Failed to load analytics' }); }
};

export const getWeakTopicsEndpoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const weakTopics = await getWeakTopics(req.user?._id as string);
    res.json({ weakTopics });
  } catch (error) { res.status(500).json({ message: 'Failed to get weak topics' }); }
};
