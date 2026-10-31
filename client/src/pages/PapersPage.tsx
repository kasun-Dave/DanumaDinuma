import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { useCatLabel, useT } from '@/lib/i18n';

interface Paper {
  _id: string;
  number: number;
  category: string;
  questionCount: number;
  attempts: number;
  bestPercent: number | null;
}

export default function PapersPage() {
  const { t } = useT();
  const catLabel = useCatLabel();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.get('/tests')
      .then((r) => setPapers(r.data.tests))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    papers.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [...counts.entries()];
  }, [papers]);

  const visible = category ? papers.filter((p) => p.category === category) : papers;
  const completed = papers.filter((p) => p.attempts > 0).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8 text-primary" />{t('papers.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('papers.subtitle')}</p>
        {papers.length > 0 && (
          <p className="text-sm text-primary mt-2 font-medium">{t('papers.completed', { n: completed, total: papers.length })}</p>
        )}
      </motion.div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!category ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
          {t('papers.all')} ({papers.length})
        </button>
        {categories.map(([c, n]) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === c ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
            {catLabel(c)} ({n})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : error ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">{t('papers.loadError')}</CardContent></Card>
      ) : visible.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">{t('papers.empty')}</CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold">{t('papers.paper', { n: p.number })}</h3>
                    {p.attempts > 0 && <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />}
                  </div>
                  <span className="self-start px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{catLabel(p.category)}</span>
                  <p className="text-sm text-muted-foreground">{t('papers.questions', { n: p.questionCount })}</p>

                  <div className="mt-auto space-y-3">
                    {p.bestPercent !== null ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{t('papers.best', { n: p.bestPercent })}</span>
                          <span>{t('papers.attempts', { n: p.attempts })}</span>
                        </div>
                        <Progress value={p.bestPercent} />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t('papers.notAttempted')}</p>
                    )}
                    <Button className="w-full" variant={p.attempts > 0 ? 'outline' : 'default'} onClick={() => navigate(`/practice?paper=${p._id}`)}>
                      {p.attempts > 0 ? <RotateCcw className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {p.attempts > 0 ? t('papers.retry') : t('papers.start')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
