import { Response } from 'express';
import { User, Friendship } from '../models';
import { AuthRequest } from '../types';

export const getGlobalLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const users = await User.find({ role: 'student' })
      .select('name username avatar xp streak college')
      .sort({ xp: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await User.countDocuments({ role: 'student' });
    const leaderboard = users.map((u, i) => ({ ...u.toObject(), rank: (page - 1) * limit + i + 1 }));
    res.json({ leaderboard, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ message: 'Failed to get leaderboard' }); }
};

export const getCollegeLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const college = req.user?.college || req.query.college as string;
    if (!college) { res.json({ leaderboard: [] }); return; }
    const users = await User.find({ role: 'student', college })
      .select('name username avatar xp streak college')
      .sort({ xp: -1 }).limit(50);
    const leaderboard = users.map((u, i) => ({ ...u.toObject(), rank: i + 1 }));
    res.json({ leaderboard });
  } catch (error) { res.status(500).json({ message: 'Failed to get college leaderboard' }); }
};

export const getFriendsLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const friendships = await Friendship.find({
      $or: [{ requesterId: userId, status: 'accepted' }, { recipientId: userId, status: 'accepted' }],
    });
    const friendIds = friendships.map((f) =>
      f.requesterId.toString() === userId ? f.recipientId : f.requesterId
    );
    friendIds.push(userId as any);
    const users = await User.find({ _id: { $in: friendIds } })
      .select('name username avatar xp streak college')
      .sort({ xp: -1 });
    const leaderboard = users.map((u, i) => ({ ...u.toObject(), rank: i + 1 }));
    res.json({ leaderboard });
  } catch (error) { res.status(500).json({ message: 'Failed to get friends leaderboard' }); }
};
