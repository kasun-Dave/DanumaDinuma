import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Bookmark, Trophy, Flame, Zap, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { useT, useCatLabel } from '@/lib/i18n';

interface DashboardData {
  totalAttempts: number; averageScore: number; quizzesCompleted: number; xp: number;
  streak: number; longestStreak: number; bookmarkCount: number; leaderboardRank: number;
  weakTopics: { topic: string; accuracy: number; attempts: number }[];
  recentQuizzes: any[]; badges: any[];
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useT();
  const catLabel = useCatLabel();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then((res) => setData(res.data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = [
    { id: 'totalAttempts', label: t('dashboard.stat.totalAttempts'), value: data?.totalAttempts || 0, icon: Target, color: 'from-blue-500 to-indigo-600' },
    { id: 'averageScore', label: t('dashboard.stat.averageScore'), value: `${data?.averageScore || 0}%`, icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
    { id: 'xpEarned', label: t('dashboard.stat.xpEarned'), value: data?.xp || 0, icon: Zap, color: 'from-amber-500 to-orange-600' },
    { id: 'dayStreak', label: t('dashboard.stat.dayStreak'), value: data?.streak || 0, icon: Flame, color: 'from-red-500 to-pink-600' },
    { id: 'quizzesDone', label: t('dashboard.stat.quizzesDone'), value: data?.quizzesCompleted || 0, icon: BookOpen, color: 'from-violet-500 to-purple-600' },
    { id: 'bookmarks', label: t('dashboard.stat.bookmarks'), value: data?.bookmarkCount || 0, icon: Bookmark, color: 'from-cyan-500 to-teal-600' },
    { id: 'rank', label: t('dashboard.stat.rank'), value: `#${data?.leaderboardRank || '-'}`, icon: Trophy, color: 'from-yellow-500 to-amber-600' },
    { id: 'longestStreak', label: t('dashboard.stat.longestStreak'), value: t('dashboard.days', { n: data?.longestStreak || 0 }), icon: Flame, color: 'from-rose-500 to-red-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">{t('dashboard.welcome')} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span> 👋</h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/practice"><Button className="bg-gradient-to-r from-primary to-indigo-600 shadow-lg shadow-primary/25"><BookOpen className="h-4 w-4 mr-2" />{t('dashboard.startPractice')}</Button></Link>
        <Link to="/practice?mode=timed"><Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white"><Zap className="h-4 w-4 mr-2" />{t('dashboard.timedQuiz')}</Button></Link>
        <Link to="/analytics"><Button variant="secondary"><BarChart3 className="h-4 w-4 mr-2" />{t('dashboard.viewAnalytics')}</Button></Link>
      </div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.id} variants={item}>
            <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-default">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <motion.div variants={item} initial="hidden" animate="show">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-destructive" />{t('dashboard.weakTopics')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data?.weakTopics && data.weakTopics.length > 0 ? data.weakTopics.slice(0, 5).map((w) => (
                <div key={w.topic} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="font-medium">{catLabel(w.topic)}</span><span className="text-muted-foreground">{Math.round(w.accuracy)}%</span></div>
                  <Progress value={w.accuracy} />
                </div>
              )) : <p className="text-muted-foreground text-sm py-4 text-center">{t('dashboard.weakTopicsEmpty')}</p>}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Quizzes */}
        <motion.div variants={item} initial="hidden" animate="show">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />{t('dashboard.recentQuizzes')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data?.recentQuizzes && data.recentQuizzes.length > 0 ? data.recentQuizzes.map((q: any) => (
                <Link key={q._id} to={`/results/${q._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium text-sm">{q.subject ? catLabel(q.subject) : t('dashboard.mixed')} — {['practice', 'timed', 'custom'].includes(q.type) ? t(`dashboard.type.${q.type}`) : q.type}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.correctOf', { n: q.totalCorrect, total: q.questionCount })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${q.totalCorrect / q.questionCount >= 0.7 ? 'text-accent' : 'text-destructive'}`}>
                      {Math.round((q.totalCorrect / q.questionCount) * 100)}%
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              )) : <p className="text-muted-foreground text-sm py-4 text-center">{t('dashboard.noQuizzes')}</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div><Skeleton className="h-9 w-72" /><Skeleton className="h-5 w-48 mt-2" /></div>
      <div className="flex gap-3"><Skeleton className="h-11 w-36" /><Skeleton className="h-11 w-32" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      <div className="grid md:grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
    </div>
  );
}
