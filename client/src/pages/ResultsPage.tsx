import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, XCircle, SkipForward, Zap, ArrowLeft, RotateCcw, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';
import { useT } from '@/lib/i18n';

export default function ResultsPage() {
  const { t } = useT();
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState<any>(location.state?.result || null);
  const [quiz, setQuiz] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    if (!result) {
      api.get(`/quiz/${id}`).then(r => {
        setQuiz(r.data.quiz);
        setAttempts(r.data.attempts);
        setResult({
          totalCorrect: r.data.quiz.totalCorrect, totalWrong: r.data.quiz.totalWrong,
          totalSkipped: r.data.quiz.totalSkipped, totalQuestions: r.data.quiz.questionCount,
          percentage: Math.round((r.data.quiz.totalCorrect / r.data.quiz.questionCount) * 100),
          xpEarned: r.data.quiz.xpEarned, score: r.data.quiz.score,
        });
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!result) return <div className="text-center py-16"><p>{t('results.notFound')}</p><Link to="/dashboard"><Button className="mt-4">{t('results.goDashboard')}</Button></Link></div>;

  const isPassing = result.percentage >= 70;
  const grade = result.percentage >= 90 ? 'A+' : result.percentage >= 80 ? 'A' : result.percentage >= 70 ? 'B' : result.percentage >= 60 ? 'C' : result.percentage >= 50 ? 'D' : 'F';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        {/* Score Circle */}
        <Card className={`border-2 ${isPassing ? 'border-accent/30' : 'border-destructive/30'} overflow-hidden`}>
          <div className={`h-2 ${isPassing ? 'bg-gradient-to-r from-accent to-emerald-400' : 'bg-gradient-to-r from-destructive to-red-400'}`} />
          <CardContent className="p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
              <div className={`inline-flex items-center justify-center h-32 w-32 rounded-full border-8 ${isPassing ? 'border-accent/20' : 'border-destructive/20'} mb-4`}>
                <div className="text-center">
                  <p className="text-4xl font-bold">{result.percentage}%</p>
                  <p className="text-sm text-muted-foreground">{t('results.grade', { grade })}</p>
                </div>
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mt-4">
              {isPassing ? `🎉 ${t('results.greatJob')}` : `📚 ${t('results.keepPracticing')}`}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isPassing ? t('results.passed') : t('results.reviewTryAgain')}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'correct', label: t('results.correct'), value: result.totalCorrect, icon: CheckCircle, color: 'text-accent' },
          { id: 'wrong', label: t('results.wrong'), value: result.totalWrong, icon: XCircle, color: 'text-destructive' },
          { id: 'skipped', label: t('results.skipped'), value: result.totalSkipped, icon: SkipForward, color: 'text-amber-500' },
          { id: 'xpEarned', label: t('results.xpEarned'), value: `+${result.xpEarned}`, icon: Zap, color: 'text-primary' },
        ].map(s => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-1`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* New Badges */}
      {result.newBadges && result.newBadges.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-bold">{result.newBadges.length > 1 ? t('results.newBadges') : t('results.newBadge')}</h3>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {result.newBadges.map((b: string) => <span key={b} className="px-3 py-1 bg-amber-500/10 rounded-full text-sm font-medium">{b}</span>)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score breakdown bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">{t('results.scoreBreakdown')}</h3>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div className="bg-accent transition-all" style={{ width: `${(result.totalCorrect / result.totalQuestions) * 100}%` }} />
            <div className="bg-destructive transition-all" style={{ width: `${(result.totalWrong / result.totalQuestions) * 100}%` }} />
            <div className="bg-muted transition-all" style={{ width: `${(result.totalSkipped / result.totalQuestions) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" />{t('results.correct')}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" />{t('results.wrong')}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted" />{t('results.skipped')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/practice"><Button variant="outline"><RotateCcw className="h-4 w-4 mr-2" />{t('results.tryAgain')}</Button></Link>
        <Link to="/dashboard"><Button><Home className="h-4 w-4 mr-2" />{t('results.dashboard')}</Button></Link>
        <Link to="/analytics"><Button variant="secondary">{t('results.viewAnalytics')}</Button></Link>
      </div>
    </div>
  );
}
