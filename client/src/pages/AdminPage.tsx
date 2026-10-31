import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, BookOpen, Target, Activity, FileUp, Plus, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { useT, useCatLabel } from '@/lib/i18n';

export default function AdminPage() {
  const { t } = useT();
  const catLabel = useCatLabel();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><Skeleton className="h-9 w-48" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div></div>;

  const cards = [
    { label: t('admin.dashboard.totalUsers'), value: stats?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: t('admin.dashboard.questions'), value: stats?.totalQuestions || 0, icon: BookOpen, color: 'from-emerald-500 to-green-600' },
    { label: t('admin.dashboard.totalAttempts'), value: stats?.totalAttempts || 0, icon: Target, color: 'from-amber-500 to-orange-600' },
    { label: t('admin.dashboard.activeUsers'), value: stats?.activeUsers || 0, icon: Activity, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="h-8 w-8 text-primary" />{t('admin.dashboard.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('admin.dashboard.subtitle')}</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/questions"><Button><Plus className="h-4 w-4 mr-2" />{t('admin.addQuestion')}</Button></Link>
        <Link to="/admin/import"><Button variant="outline"><FileUp className="h-4 w-4 mr-2" />{t('admin.dashboard.importPdfJson')}</Button></Link>
        <Link to="/admin/review"><Button variant="secondary"><CheckSquare className="h-4 w-4 mr-2" />{t('admin.reviewQueue')}</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden"><div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-5`} />
              <CardContent className="p-4"><div className="flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground font-medium">{c.label}</p><p className="text-2xl font-bold mt-1">{c.value}</p></div>
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}><c.icon className="h-5 w-5 text-white" /></div>
              </div></CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Topics */}
      {stats?.topTopics && stats.topTopics.length > 0 && (
        <Card><CardHeader><CardTitle className="text-lg">{t('admin.dashboard.topTopics')}</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">
            {stats.topTopics.map((tp: any, i: number) => (
              <div key={tp._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <span className="font-medium text-sm">{i + 1}. {catLabel(tp._id)}</span>
                <span className="text-sm text-muted-foreground">{t('admin.dashboard.attemptsCount', { n: tp.count })}</span>
              </div>
            ))}
          </div></CardContent>
        </Card>
      )}

      {/* Recent Logs */}
      {stats?.recentLogs && stats.recentLogs.length > 0 && (
        <Card><CardHeader><CardTitle className="text-lg">{t('admin.dashboard.recentActivity')}</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">
            {stats.recentLogs.map((log: any) => (
              <div key={log._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm">
                <div><span className="font-medium">{log.action}</span><span className="text-muted-foreground ml-2">{log.details}</span></div>
                <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div></CardContent>
        </Card>
      )}
    </div>
  );
}
