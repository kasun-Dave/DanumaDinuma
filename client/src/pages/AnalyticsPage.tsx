import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import api from '@/lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/detailed').then(r => setData(r.data.analytics)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><Skeleton className="h-9 w-48" /><div className="grid md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-80" />)}</div></div>;

  const trendData = data?.attemptTrends?.map((d: any) => ({ date: d._id.slice(5), attempts: d.attempts, correct: d.correct })) || [];
  const scoreData = data?.scoreHistory?.map((q: any, i: number) => ({ quiz: i + 1, score: Math.round((q.totalCorrect / q.questionCount) * 100) })) || [];
  const radarData = data?.topicAccuracy?.slice(0, 8).map((t: any) => ({ topic: t.topic.length > 12 ? t.topic.slice(0, 12) + '...' : t.topic, accuracy: Math.round(t.accuracy) })) || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 className="h-8 w-8 text-primary" />Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress and identify weak areas</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attempt Trends */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Daily Activity (Last 30 Days)</CardTitle></CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="attempts" stroke="#4f46e5" fill="url(#colorAttempts)" strokeWidth={2} />
                  <Area type="monotone" dataKey="correct" stroke="#10b981" fill="url(#colorCorrect)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">No data yet. Complete some quizzes!</p>}
          </CardContent>
        </Card>

        {/* Score History */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent" />Score History</CardTitle></CardHeader>
          <CardContent>
            {scoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="quiz" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">No quizzes completed yet</p>}
          </CardContent>
        </Card>

        {/* Topic Radar */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-amber-500" />Topic Mastery</CardTitle></CardHeader>
          <CardContent>
            {radarData.length > 2 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="topic" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={10} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-12">Need more data for topic radar</p>}
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-destructive" />Weak Topics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data?.weakTopics?.length > 0 ? data.weakTopics.map((t: any) => (
              <div key={t.topic} className="space-y-1">
                <div className="flex justify-between text-sm"><span className="font-medium">{t.topic}</span><span className={`font-bold ${t.accuracy < 50 ? 'text-destructive' : t.accuracy < 70 ? 'text-amber-500' : 'text-accent'}`}>{Math.round(t.accuracy)}%</span></div>
                <Progress value={t.accuracy} />
                <p className="text-xs text-muted-foreground">{t.attempts} attempts</p>
              </div>
            )) : <p className="text-muted-foreground text-center py-12">No weak topics found yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
