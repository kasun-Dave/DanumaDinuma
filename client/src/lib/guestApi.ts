import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { allQuestions, guestTests } from '@/data/bank';
import type { GuestQuestion } from '@/data/guestQuestions';
import { translate, useLangStore } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import {
  GUEST_BADGES, buildGuestUser, calculateXp, computeStats, dayKey, loadGuest, newId, saveGuest,
  type GuestAttempt, type GuestQuiz, type GuestState,
} from '@/lib/guestStore';

// Axios adapter that answers the app's API calls from the bundled question bank and
// localStorage, so guest mode works with no backend. Response shapes mirror server/src.

const byId = new Map<string, GuestQuestion>(allQuestions.map((q) => [q._id, q]));

// Messages shown to the user come from the i18n files so they follow the chosen language.
const tr = (key: string) => translate(useLangStore.getState().lang, key);

function respond(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: String(status), headers: {}, config, request: {} };
}

function fail(config: InternalAxiosRequestConfig, status: number, message: string): never {
  throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, respond(config, { message }, status));
}

function parseBody(config: InternalAxiosRequestConfig): any {
  if (typeof config.data !== 'string') return config.data ?? {};
  try { return JSON.parse(config.data); } catch { return {}; }
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const percent = (correct: number, total: number) => (total > 0 ? Math.round((correct / total) * 100) : 0);

function syncUser(): void {
  const { isGuest, setUser } = useAuthStore.getState();
  if (isGuest) setUser(buildGuestUser());
}

function topicStats(state: GuestState) {
  const map = new Map<string, { attempts: number; correct: number }>();
  for (const a of state.attempts) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const t = map.get(q.topic) || { attempts: 0, correct: 0 };
    t.attempts++;
    if (a.isCorrect) t.correct++;
    map.set(q.topic, t);
  }
  return [...map.entries()].map(([topic, t]) => ({ topic, attempts: t.attempts, accuracy: percent(t.correct, t.attempts) }));
}

const weakTopics = (state: GuestState) =>
  topicStats(state).filter((t) => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);

function createQuiz(config: InternalAxiosRequestConfig, state: GuestState) {
  const { type, subject, topics, difficulty, questionCount, timeLimit, negativeMarking, testId } = parseBody(config);

  // A ready-made paper: fixed 10 questions in fixed order.
  const test = testId ? guestTests.find((t) => t._id === testId) : undefined;
  if (testId && !test) fail(config, 404, tr('api.noQuestions'));

  const pool = test
    ? test.questionIds.map((id) => byId.get(id)).filter((q): q is GuestQuestion => !!q)
    : allQuestions.filter((q) =>
        (!subject || q.subject === subject) &&
        (!topics?.length || topics.includes(q.topic)) &&
        (!difficulty || difficulty === 'mixed' || q.difficulty === difficulty));
  if (pool.length === 0) fail(config, 404, tr('api.noQuestions'));

  const questions = test ? pool : shuffle(pool).slice(0, Math.max(1, Number(questionCount) || 10));
  const quiz: GuestQuiz = {
    _id: newId(), userId: 'guest', type: type === 'timed' ? 'timed' : 'practice', subject: test ? test.category : subject || '',
    testId: test?._id, topics: topics || [], difficulty: difficulty || 'mixed', questionIds: questions.map((q) => q._id),
    questionCount: questions.length, timeLimit: type === 'timed' ? timeLimit || 30 : 0,
    negativeMarking: !!negativeMarking, negativeMarkValue: 0.25, status: 'in_progress',
    score: 0, totalCorrect: 0, totalWrong: 0, totalSkipped: 0, xpEarned: 0, startedAt: new Date().toISOString(),
  };
  state.quizzes.push(quiz);
  saveGuest(state);
  return respond(config, { quiz: { ...quiz, questions } }, 201);
}

function submitQuiz(config: InternalAxiosRequestConfig, state: GuestState) {
  const { quizId, answers } = parseBody(config);
  const quiz = state.quizzes.find((q) => q._id === quizId);
  if (!quiz) fail(config, 404, tr('api.quizNotFound'));
  if (quiz.status === 'completed') fail(config, 400, tr('api.alreadySubmitted'));

  const now = new Date().toISOString();
  let correct = 0, wrong = 0, skipped = 0, score = 0;
  for (const a of (answers || []) as { questionId: string; selectedOptionIndex: number; timeTaken?: number }[]) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const isCorrect = a.selectedOptionIndex === q.correctOptionIndex;
    if (isCorrect) { correct++; score += 1; }
    else if (a.selectedOptionIndex === -1) skipped++;
    else { wrong++; if (quiz.negativeMarking) score -= quiz.negativeMarkValue; }
    const attempt: GuestAttempt = {
      quizId: quiz._id, questionId: a.questionId, selectedOptionIndex: a.selectedOptionIndex,
      isCorrect, timeTaken: a.timeTaken || 0, xpEarned: isCorrect ? 10 : 0, createdAt: now,
    };
    state.attempts.push(attempt);
  }

  const streakBefore = computeStats(state).streak;
  Object.assign(quiz, {
    status: 'completed', score: Math.max(0, score), totalCorrect: correct, totalWrong: wrong, totalSkipped: skipped,
    xpEarned: calculateXp(correct, streakBefore, quiz.questionCount), completedAt: now,
  });

  const stats = computeStats(state);
  const earnedNow = GUEST_BADGES.filter((b) => b.earned(stats) && !state.badges.includes(b.name));
  state.badges.push(...earnedNow.map((b) => b.name));
  const newBadges = earnedNow.map((b) => tr(`badge.${b.name}`));
  saveGuest(state);
  syncUser();

  return respond(config, { result: {
    quizId: quiz._id, score: quiz.score, totalCorrect: correct, totalWrong: wrong, totalSkipped: skipped,
    totalQuestions: quiz.questionCount, percentage: percent(correct, quiz.questionCount),
    xpEarned: quiz.xpEarned, newBadges, negativeMarking: quiz.negativeMarking,
  } });
}

function dashboard(config: InternalAxiosRequestConfig, state: GuestState) {
  const stats = computeStats(state);
  const done = state.quizzes.filter((q) => q.status === 'completed');
  const averageScore = done.length
    ? Math.round(done.reduce((sum, q) => sum + percent(q.totalCorrect, q.questionCount), 0) / done.length)
    : 0;
  return respond(config, { dashboard: {
    totalAttempts: state.attempts.length, averageScore, quizzesCompleted: done.length, xp: stats.xp,
    streak: stats.streak, longestStreak: stats.longestStreak, bookmarkCount: state.bookmarks.length,
    leaderboardRank: 0, weakTopics: weakTopics(state), recentQuizzes: [...done].reverse().slice(0, 5),
    badges: GUEST_BADGES.filter((b) => state.badges.includes(b.name)).map(({ name, description, icon }) => ({ name: tr(`badge.${name}`), description, icon })),
  } });
}

function detailedAnalytics(config: InternalAxiosRequestConfig, state: GuestState) {
  const since = Date.now() - 30 * 86400000;
  const perDay = new Map<string, { attempts: number; correct: number }>();
  for (const a of state.attempts) {
    if (new Date(a.createdAt).getTime() < since) continue;
    const key = dayKey(new Date(a.createdAt));
    const d = perDay.get(key) || { attempts: 0, correct: 0 };
    d.attempts++;
    if (a.isCorrect) d.correct++;
    perDay.set(key, d);
  }
  return respond(config, { analytics: {
    attemptTrends: [...perDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([_id, d]) => ({ _id, ...d })),
    scoreHistory: state.quizzes.filter((q) => q.status === 'completed').slice(-20)
      .map((q) => ({ totalCorrect: q.totalCorrect, questionCount: q.questionCount })),
    topicAccuracy: topicStats(state).sort((a, b) => b.attempts - a.attempts),
    weakTopics: weakTopics(state),
  } });
}

function bookmarks(config: InternalAxiosRequestConfig, state: GuestState) {
  const search = String((config.params || {}).search || '').toLowerCase();
  const list = state.bookmarks
    .map((id) => ({ _id: id, questionId: byId.get(id) }))
    .filter((b) => b.questionId && (!search || `${b.questionId.questionText} ${b.questionId.topic} ${b.questionId.subject}`.toLowerCase().includes(search)));
  return respond(config, { bookmarks: list });
}

export async function guestAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method || 'get').toLowerCase();
  const path = (config.url || '').split('?')[0].replace(/^\/api(?=\/)/, '');
  const state = loadGuest();
  const route = `${method} ${path}`;

  if (route === 'get /questions/subjects') {
    const map = new Map<string, { count: number; topics: Set<string> }>();
    for (const q of allQuestions) {
      const s = map.get(q.subject) || { count: 0, topics: new Set<string>() };
      s.count++;
      s.topics.add(q.topic);
      map.set(q.subject, s);
    }
    const subjects = [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([_id, s]) => ({ _id, count: s.count, topics: [...s.topics] }));
    return respond(config, { subjects });
  }
  if (route === 'get /tests') {
    const done = state.quizzes.filter((q) => q.status === 'completed' && q.testId);
    const tests = guestTests.map((test, i) => {
      const mine = done.filter((q) => q.testId === test._id);
      return {
        _id: test._id, number: i + 1, category: test.category, questionCount: test.questionIds.length,
        attempts: mine.length,
        bestPercent: mine.length ? Math.max(...mine.map((q) => percent(q.totalCorrect, q.questionCount))) : null,
      };
    });
    return respond(config, { tests });
  }
  if (route === 'post /quiz/create') return createQuiz(config, state);
  if (route === 'post /quiz/submit') return submitQuiz(config, state);
  if (method === 'get' && path.startsWith('/quiz/')) {
    const id = path.slice('/quiz/'.length);
    const quiz = state.quizzes.find((q) => q._id === id);
    if (!quiz) fail(config, 404, tr('api.quizNotFound'));
    return respond(config, {
      quiz: { ...quiz, questionIds: quiz.questionIds.map((qid) => byId.get(qid)) },
      attempts: state.attempts.filter((a) => a.quizId === id),
    });
  }
  if (route === 'get /bookmarks') return bookmarks(config, state);
  if (route === 'post /bookmarks/toggle') {
    const { questionId } = parseBody(config);
    if (!byId.has(questionId)) fail(config, 404, tr('api.questionNotFound'));
    const has = state.bookmarks.includes(questionId);
    state.bookmarks = has ? state.bookmarks.filter((id) => id !== questionId) : [...state.bookmarks, questionId];
    saveGuest(state);
    return respond(config, { bookmarked: !has });
  }
  if (method === 'delete' && path.startsWith('/bookmarks/')) {
    const id = path.slice('/bookmarks/'.length);
    state.bookmarks = state.bookmarks.filter((b) => b !== id);
    saveGuest(state);
    return respond(config, { message: 'Bookmark removed' });
  }
  if (route === 'get /analytics/dashboard') return dashboard(config, state);
  if (route === 'get /analytics/detailed') return detailedAnalytics(config, state);
  if (route === 'put /auth/profile') {
    const { name, college, year } = parseBody(config);
    state.profile = {
      name: typeof name === 'string' && name.trim() ? name.trim() : state.profile.name,
      college: typeof college === 'string' ? college : state.profile.college,
      year: Number(year) || state.profile.year,
    };
    saveGuest(state);
    return respond(config, { user: buildGuestUser() });
  }
  if (route === 'post /auth/logout') return respond(config, { message: 'ok' });
  if (method === 'get' && path.startsWith('/leaderboard/')) return respond(config, { leaderboard: [] });
  if (route === 'get /friends') return respond(config, { friends: [], pendingRequests: [] });
  if (route === 'get /friends/search') return respond(config, { users: [] });

  return fail(config, 404, tr('api.notAvailable'));
}
