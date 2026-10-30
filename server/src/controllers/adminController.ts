import { Response } from 'express';
import multer from 'multer';
import { Question, User, Quiz, Attempt, AdminLog } from '../models';
import { AuthRequest } from '../types';
import { parsePdfBuffer, detectDuplicates } from '../utils/pdfParser';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files allowed'));
}});

export const uploadMiddleware = upload.single('pdf');

export const uploadPdf = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ message: 'PDF file is required' }); return; }
    const subject = req.body.subject || 'Physiology';
    const topic = req.body.topic || 'General';
    const result = await parsePdfBuffer(req.file.buffer, subject, topic);
    // Check for duplicates against existing questions (for stats only)
    const existingQuestions = await Question.find({}).select('questionText').lean();
    const existingTexts = existingQuestions.map((q) => q.questionText);
    const { unique, duplicates } = detectDuplicates(result.questions, existingTexts);
    
    // Save ALL questions directly to the database as published
    let insertedCount = 0;
    if (result.questions.length > 0) {
      const questionsToInsert = result.questions.map((q) => ({
        ...q,
        createdBy: req.user?._id,
        isPublished: true
      }));
      const inserted = await Question.insertMany(questionsToInsert);
      insertedCount = inserted.length;
    }

    await AdminLog.create({ adminId: req.user?._id, action: 'pdf_upload',
      details: `Uploaded PDF: ${req.file.originalname}`, metadata: { totalFound: result.totalFound, parsed: result.questions.length, unique: unique.length, duplicates: duplicates.length, errors: result.errors.length, inserted: insertedCount } });
    res.json({ parsed: { questions: result.questions, duplicates, errors: result.errors, totalFound: result.totalFound, uniqueCount: unique.length, duplicateCount: duplicates.length, insertedCount } });
  } catch (error: any) { console.error('PDF upload error:', error); res.status(500).json({ message: 'Failed to parse PDF' }); }
};

export const importJson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questions } = req.body;
    const created = await Question.insertMany(questions.map((q: any) => ({ ...q, createdBy: req.user?._id, isPublished: false })));
    await AdminLog.create({ adminId: req.user?._id, action: 'json_import', details: `Imported ${created.length} questions` });
    res.status(201).json({ message: `${created.length} questions imported`, count: created.length });
  } catch (error) { res.status(500).json({ message: 'Failed to import questions' }); }
};

export const getReviewQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const [questions, total] = await Promise.all([
      Question.find({ isPublished: false }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Question.countDocuments({ isPublished: false }),
    ]);
    res.json({ questions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ message: 'Failed to get review questions' }); }
};

export const publishQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionIds } = req.body;
    const result = await Question.updateMany({ _id: { $in: questionIds } }, { isPublished: true });
    await AdminLog.create({ adminId: req.user?._id, action: 'publish_questions', details: `Published ${result.modifiedCount} questions` });
    res.json({ message: `${result.modifiedCount} questions published` });
  } catch (error) { res.status(500).json({ message: 'Failed to publish questions' }); }
};

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalQuestions, totalAttempts, totalQuizzes, recentLogs, topTopics] = await Promise.all([
      User.countDocuments(), Question.countDocuments(), Attempt.countDocuments(), Quiz.countDocuments(),
      AdminLog.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'name'),
      Attempt.aggregate([
        { $lookup: { from: 'questions', localField: 'questionId', foreignField: '_id', as: 'q' } },
        { $unwind: '$q' },
        { $group: { _id: '$q.topic', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),
    ]);
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    res.json({ stats: { totalUsers, totalQuestions, totalAttempts, totalQuizzes, activeUsers, recentLogs, topTopics } });
  } catch (error) { res.status(500).json({ message: 'Failed to get admin stats' }); }
};
