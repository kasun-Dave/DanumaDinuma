import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1),
});

export const createQuestionSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  subtopic: z.string().optional().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questionText: z.string().min(10),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctOptionIndex: z.number().min(0),
  explanation: z.string().optional().default(''),
  conceptSummary: z.string().optional().default(''),
  wrongOptionExplanations: z.array(z.string()).optional().default([]),
  source: z.string().optional().default('manual'),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const createQuizSchema = z.object({
  type: z.enum(['practice', 'timed', 'custom']),
  subject: z.string().optional().default(''),
  topics: z.array(z.string()).optional().default([]),
  difficulty: z.string().optional().default('mixed'),
  questionCount: z.number().min(1).max(200).default(10),
  timeLimit: z.number().min(0).optional().default(0),
  negativeMarking: z.boolean().optional().default(false),
  negativeMarkValue: z.number().min(0).max(1).optional().default(0.25),
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionIndex: z.number().min(-1),
      timeTaken: z.number().min(0).default(0),
    })
  ),
});

export const bookmarkSchema = z.object({
  questionId: z.string().min(1),
  note: z.string().max(500).optional().default(''),
});

export const friendRequestSchema = z.object({
  recipientId: z.string().min(1),
});

export const friendActionSchema = z.object({
  friendshipId: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  college: z.string().max(200).optional(),
  year: z.number().min(1).max(5).optional(),
  avatar: z.string().optional(),
  theme: z.enum(['light', 'dark']).optional(),
});

export const bulkImportSchema = z.object({
  questions: z.array(createQuestionSchema).min(1),
});
