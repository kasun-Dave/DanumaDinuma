import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  conceptSummary: string;
  wrongOptionExplanations: string[];
  source: string;
  tags: string[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subtopic: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2 && v.length <= 6,
        message: 'Options must have between 2 and 6 items',
      },
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: {
      type: String,
      default: '',
    },
    conceptSummary: {
      type: String,
      default: '',
    },
    wrongOptionExplanations: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      default: 'manual',
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ questionText: 'text' });
questionSchema.index({ isPublished: 1, subject: 1, topic: 1, difficulty: 1 });

export default mongoose.model<IQuestion>('Question', questionSchema);
