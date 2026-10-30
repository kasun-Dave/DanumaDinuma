import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  criteriaType: string;
  criteriaThreshold: number;
}

const badgeSchema = new Schema<IBadge>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    criteriaType: {
      type: String,
      required: true,
      enum: [
        'quizzes_completed',
        'correct_answers',
        'streak_days',
        'xp_earned',
        'subjects_mastered',
        'first_quiz',
        'bookmarks_count',
        'friends_count',
      ],
    },
    criteriaThreshold: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBadge>('Badge', badgeSchema);
