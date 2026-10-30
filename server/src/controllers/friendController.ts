import { Response } from 'express';
import { User, Friendship } from '../models';
import { AuthRequest } from '../types';

export const getFriends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const friendships = await Friendship.find({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' },
      ],
    }).populate('requesterId recipientId', 'name username avatar xp college');
    const friends = friendships.map((f: any) => {
      const friend = f.requesterId._id.toString() === userId ? f.recipientId : f.requesterId;
      return { friendshipId: f._id, ...friend.toObject() };
    });
    // Pending requests received
    const pending = await Friendship.find({ recipientId: userId, status: 'pending' })
      .populate('requesterId', 'name username avatar');
    res.json({ friends, pendingRequests: pending });
  } catch (error) { res.status(500).json({ message: 'Failed to get friends' }); }
};

export const sendFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipientId } = req.body;
    const userId = req.user?._id;
    if (recipientId === userId) { res.status(400).json({ message: 'Cannot friend yourself' }); return; }
    const existing = await Friendship.findOne({
      $or: [
        { requesterId: userId, recipientId },
        { requesterId: recipientId, recipientId: userId },
      ],
    });
    if (existing) { res.status(409).json({ message: 'Friend request already exists' }); return; }
    const friendship = await Friendship.create({ requesterId: userId, recipientId });
    res.status(201).json({ friendship });
  } catch (error) { res.status(500).json({ message: 'Failed to send request' }); }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { friendshipId } = req.body;
    const friendship = await Friendship.findOneAndUpdate(
      { _id: friendshipId, recipientId: req.user?._id, status: 'pending' },
      { status: 'accepted' }, { new: true }
    );
    if (!friendship) { res.status(404).json({ message: 'Request not found' }); return; }
    res.json({ friendship });
  } catch (error) { res.status(500).json({ message: 'Failed to accept request' }); }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { friendshipId } = req.body;
    const friendship = await Friendship.findOneAndUpdate(
      { _id: friendshipId, recipientId: req.user?._id, status: 'pending' },
      { status: 'rejected' }, { new: true }
    );
    if (!friendship) { res.status(404).json({ message: 'Request not found' }); return; }
    res.json({ friendship });
  } catch (error) { res.status(500).json({ message: 'Failed to reject request' }); }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q) { res.json({ users: [] }); return; }
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user?._id } },
        { $or: [
          { username: { $regex: q as string, $options: 'i' } },
          { email: { $regex: q as string, $options: 'i' } },
          { name: { $regex: q as string, $options: 'i' } },
        ]},
      ],
    }).select('name username avatar college xp').limit(20);
    res.json({ users });
  } catch (error) { res.status(500).json({ message: 'Failed to search users' }); }
};
