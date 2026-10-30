import { Request } from 'express';

export interface IUser {
  _id: string;
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
  badges: string[];
  googleId?: string;
  refreshToken?: string;
  theme: 'light' | 'dark';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface User {
      _id: string;
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
      badges: string[];
      googleId?: string;
      refreshToken?: string;
      theme: 'light' | 'dark';
      resetPasswordToken?: string;
      resetPasswordExpires?: Date;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

export type AuthRequest = Request;

export interface TokenPayload {
  userId: string;
  role: 'student' | 'admin';
}

export interface QuizSubmission {
  quizId: string;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
    timeTaken: number;
  }[];
}

export interface ParsedQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  subject?: string;
  topic?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface QuestionFilter {
  subject?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  isPublished?: boolean;
}
