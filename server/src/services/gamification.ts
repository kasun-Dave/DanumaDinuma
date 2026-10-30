import { User, Quiz, Attempt, Badge } from '../models';

const XP_CORRECT = 10;
const XP_STREAK_BONUS = 5;
const XP_QUIZ_COMPLETE = 20;

export const awardXP = async (userId: string, amount: number): Promise<number> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: amount } },
    { new: true }
  );
  return user?.xp || 0;
};

export const calculateQuizXP = (
  totalCorrect: number,
  streak: number,
  questionCount: number
): number => {
  let xp = totalCorrect * XP_CORRECT;
  xp += XP_QUIZ_COMPLETE;
  
  // Streak bonus
  if (streak >= 3) {
    xp += streak * XP_STREAK_BONUS;
  }

  // Perfect score bonus
  if (totalCorrect === questionCount) {
    xp += 50;
  }

  return xp;
};

export const updateStreak = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (user.currentStreakStart) {
    const lastStart = new Date(user.currentStreakStart);
    const lastDate = new Date(lastStart.getFullYear(), lastStart.getMonth(), lastStart.getDate());

    if (lastDate.getTime() === today.getTime()) {
      // Already updated today
      return;
    }

    // Check if last activity was yesterday (continuing streak)
    const lastQuiz = await Quiz.findOne({
      userId,
      status: 'completed',
      completedAt: { $gte: yesterday, $lt: today },
    });

    if (lastQuiz) {
      user.streak += 1;
    } else {
      // Streak broken, start new one
      user.streak = 1;
      user.currentStreakStart = now;
    }
  } else {
    user.streak = 1;
    user.currentStreakStart = now;
  }

  if (user.streak > user.longestStreak) {
    user.longestStreak = user.streak;
  }

  await user.save();
};

export const checkAndAwardBadges = async (userId: string): Promise<string[]> => {
  const user = await User.findById(userId);
  if (!user) return [];

  const allBadges = await Badge.find();
  const newBadges: string[] = [];
  const userBadgeIds = user.badges.map((b) => b.toString());

  for (const badge of allBadges) {
    if (userBadgeIds.includes(badge._id.toString())) continue;

    let earned = false;

    switch (badge.criteriaType) {
      case 'first_quiz': {
        const quizCount = await Quiz.countDocuments({ userId, status: 'completed' });
        earned = quizCount >= 1;
        break;
      }
      case 'quizzes_completed': {
        const quizCount = await Quiz.countDocuments({ userId, status: 'completed' });
        earned = quizCount >= badge.criteriaThreshold;
        break;
      }
      case 'correct_answers': {
        const correctCount = await Attempt.countDocuments({ userId, isCorrect: true });
        earned = correctCount >= badge.criteriaThreshold;
        break;
      }
      case 'streak_days': {
        earned = user.longestStreak >= badge.criteriaThreshold;
        break;
      }
      case 'xp_earned': {
        earned = user.xp >= badge.criteriaThreshold;
        break;
      }
    }

    if (earned) {
      user.badges.push(badge._id as any);
      newBadges.push(badge.name);
    }
  }

  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
};

export const getWeakTopics = async (userId: string): Promise<{ topic: string; accuracy: number; attempts: number }[]> => {
  const result = await Attempt.aggregate([
    { $match: { userId: userId } },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'question',
      },
    },
    { $unwind: '$question' },
    {
      $group: {
        _id: '$question.topic',
        totalAttempts: { $sum: 1 },
        correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
      },
    },
    {
      $project: {
        topic: '$_id',
        attempts: '$totalAttempts',
        accuracy: {
          $multiply: [
            { $divide: ['$correctAttempts', '$totalAttempts'] },
            100,
          ],
        },
      },
    },
    { $sort: { accuracy: 1 } },
    { $limit: 10 },
  ]);

  return result;
};
