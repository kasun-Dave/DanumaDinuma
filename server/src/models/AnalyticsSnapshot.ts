import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  topicAccuracy: Map<string, number>;
  totalAttempts: number;
  correctAnswers: number;
  averageScore: number;
  subjectBreakdown: Map<string, { attempts: number; correct: number }>;
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    topicAccuracy: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    subjectBreakdown: {
      type: Map,
      of: new Schema(
        {
          attempts: { type: Number, default: 0 },
          correct: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

analyticsSnapshotSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IAnalyticsSnapshot>('AnalyticsSnapshot', analyticsSnapshotSchema);
