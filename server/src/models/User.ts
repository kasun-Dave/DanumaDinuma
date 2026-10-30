import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  username: string;
  avatar: string;
  role: 'student' | 'admin';
  college: string;
  year: number;
  xp: number;
  streak: number;
  currentStreakStart: Date | null;
  longestStreak: number;
  badges: mongoose.Types.ObjectId[];
  googleId?: string;
  refreshToken?: string;
  theme: 'light' | 'dark';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 30,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    college: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    currentStreakStart: {
      type: Date,
      default: null,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    googleId: {
      type: String,
      sparse: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ xp: -1 });
userSchema.index({ college: 1, xp: -1 });

export default mongoose.model<IUser>('User', userSchema);
