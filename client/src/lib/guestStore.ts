import type { User } from '@/stores/authStore';
import { translate, useLangStore } from '@/lib/i18n';

// Guest mode keeps everything in this browser (localStorage). No account, API or database needed.

const KEY = 'danumadinuma-guest';

export interface GuestQuiz {
  _id: string;
  userId: string;
  testId?: string;
  type: 'practice' | 'timed';
  subject: string;
  topics: string[];
  difficulty: string;
  questionIds: string[];
  questionCount: number;
  timeLimit: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  status: 'in_progress' | 'completed';
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  xpEarned: number;
  startedAt: string;
  completedAt?: string;
}

export interface GuestAttempt {
  quizId: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeTaken: number;
  xpEarned: number;
  createdAt: string;
}

export interface GuestState {
  quizzes: GuestQuiz[];
  attempts: GuestAttempt[];
  bookmarks: string[];
  badges: string[];
  profile: { name?: string; college?: string; year?: number };
}

const empty = (): GuestState => ({ quizzes: [], attempts: [], bookmarks: [], badges: [], profile: {} });

// In-memory copy so the app still works if localStorage is blocked.
let cache: GuestState | undefined;

export function loadGuest(): GuestState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    cache = empty();
  }
  return cache as GuestState;
}

export function saveGuest(state: GuestState): void {
  cache = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: keep the in-memory copy
  }
}

export const newId = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayNumber = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

export function computeStats(state: GuestState): { xp: number; streak: number; longestStreak: number; completed: number; correct: number } {
  const done = state.quizzes.filter((q) => q.status === 'completed');
  const xp = done.reduce((sum, q) => sum + q.xpEarned, 0);
  const correct = done.reduce((sum, q) => sum + q.totalCorrect, 0);
  const days = [...new Set(done.map((q) => dayKey(new Date(q.completedAt || q.startedAt))))].map(dayNumber).sort((a, b) => a - b);

  let longestStreak = 0;
  let run = 0;
  days.forEach((n, i) => {
    run = i > 0 && n === days[i - 1] + 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  });

  const today = dayNumber(dayKey(new Date()));
  const have = new Set(days);
  let cursor = have.has(today) ? today : today - 1;
  let streak = 0;
  while (have.has(cursor)) {
    streak++;
    cursor--;
  }
  return { xp, streak, longestStreak, completed: done.length, correct };
}

// Same rules as server/src/services/gamification.ts
export function calculateXp(totalCorrect: number, streak: number, questionCount: number): number {
  let xp = totalCorrect * 10 + 20;
  if (streak >= 3) xp += streak * 5;
  if (totalCorrect === questionCount) xp += 50;
  return xp;
}

export const GUEST_BADGES: { name: string; description: string; icon: string; earned: (m: ReturnType<typeof computeStats>) => boolean }[] = [
  { name: 'First Quiz', description: 'Complete your first quiz', icon: '🎯', earned: (m) => m.completed >= 1 },
  { name: 'Quiz Enthusiast', description: 'Complete 10 quizzes', icon: '📝', earned: (m) => m.completed >= 10 },
  { name: 'Quiz Master', description: 'Complete 50 quizzes', icon: '🏆', earned: (m) => m.completed >= 50 },
  { name: 'Sharp Mind', description: 'Get 100 correct answers', icon: '🧠', earned: (m) => m.correct >= 100 },
  { name: 'Brilliant Scholar', description: 'Get 500 correct answers', icon: '💎', earned: (m) => m.correct >= 500 },
  { name: '7 Day Streak', description: 'Maintain a 7-day streak', icon: '🔥', earned: (m) => m.streak >= 7 },
  { name: '30 Day Streak', description: 'Maintain a 30-day streak', icon: '⚡', earned: (m) => m.streak >= 30 },
  { name: 'XP Hunter', description: 'Earn 1000 XP', icon: '⭐', earned: (m) => m.xp >= 1000 },
  { name: 'XP Legend', description: 'Earn 5000 XP', icon: '🌟', earned: (m) => m.xp >= 5000 },
];

export function buildGuestUser(): User {
  const state = loadGuest();
  const stats = computeStats(state);
  return {
    _id: 'guest',
    name: state.profile.name || translate(useLangStore.getState().lang, 'guest.name'),
    email: '',
    username: 'guest',
    avatar: '',
    role: 'student',
    college: state.profile.college || '',
    year: state.profile.year || 1,
    xp: stats.xp,
    streak: stats.streak,
    longestStreak: stats.longestStreak,
    badges: state.badges,
    theme: 'dark',
  };
}
