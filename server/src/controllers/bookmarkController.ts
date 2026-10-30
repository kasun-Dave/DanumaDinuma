import { Response } from 'express';
import { Bookmark } from '../models';
import { AuthRequest } from '../types';

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const query: any = { userId: req.user?._id };
    const bookmarks = await Bookmark.find(query)
      .populate('questionId')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const total = await Bookmark.countDocuments(query);
    // Filter by search text if provided (after populate)
    let filtered = bookmarks;
    if (search) {
      const s = (search as string).toLowerCase();
      filtered = bookmarks.filter((b: any) => b.questionId?.questionText?.toLowerCase().includes(s));
    }
    res.json({ bookmarks: filtered, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) { res.status(500).json({ message: 'Failed to get bookmarks' }); }
};

export const createBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId, note } = req.body;
    const existing = await Bookmark.findOne({ userId: req.user?._id, questionId });
    if (existing) { res.status(409).json({ message: 'Already bookmarked' }); return; }
    const bookmark = await Bookmark.create({ userId: req.user?._id, questionId, note: note || '' });
    res.status(201).json({ bookmark });
  } catch (error) { res.status(500).json({ message: 'Failed to create bookmark' }); }
};

export const deleteBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.user?._id });
    if (!bookmark) { res.status(404).json({ message: 'Bookmark not found' }); return; }
    res.json({ message: 'Bookmark removed' });
  } catch (error) { res.status(500).json({ message: 'Failed to delete bookmark' }); }
};

export const toggleBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.body;
    const existing = await Bookmark.findOne({ userId: req.user?._id, questionId });
    if (existing) {
      await existing.deleteOne();
      res.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      await Bookmark.create({ userId: req.user?._id, questionId });
      res.json({ bookmarked: true, message: 'Bookmark added' });
    }
  } catch (error) { res.status(500).json({ message: 'Failed to toggle bookmark' }); }
};
