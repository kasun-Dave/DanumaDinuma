import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'practice' | 'timed' | 'custom';
  subject: string;
  topics: string[];
  difficulty: string;
  questionIds: mongoose.Types.ObjectId[];
  questionCount: number;
  timeLimit: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  status: 'active' | 'completed' | 'abandoned';
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  xpEarned: number;
  startedAt: Date;
  completedAt: Date | null;
}

const quizSchema = new Schema<IQuiz>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['practice', 'timed', 'custom'],
      required: true,
    },
    subject: {
      type: String,
      default: '',
    },
    topics: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      default: 'mixed',
    },
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    questionCount: {
      type: Number,
      required: true,
    },
    timeLimit: {
      type: Number,
      default: 0,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    negativeMarkValue: {
      type: Number,
      default: 0.25,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    score: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    totalWrong: {
      type: Number,
      default: 0,
    },
    totalSkipped: {
      type: Number,
      default: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ userId: 1, status: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IQuiz>('Quiz', quizSchema);
