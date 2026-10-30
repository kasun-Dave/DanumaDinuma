import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Check, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

export default function AdminReviewPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    api.get('/admin/review').then(r => setQuestions(r.data.questions)).finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectAll = () => {
    if (selected.size === questions.length) setSelected(new Set());
    else setSelected(new Set(questions.map(q => q._id)));
  };

  const publishSelected = async () => {
    setPublishing(true);
    try {
      await api.post('/admin/publish', { questionIds: Array.from(selected) });
      setQuestions(q => q.filter(x => !selected.has(x._id)));
      setSelected(new Set());
    } catch {}
    finally { setPublishing(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><CheckSquare className="h-8 w-8 text-primary" />Review Queue</h1>
        <p className="text-muted-foreground mt-1">Review and publish unpublished questions</p>
      </motion.div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div> : questions.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><CheckSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">All caught up!</h3><p className="text-muted-foreground">No questions pending review</p></CardContent></Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={selectAll}>{selected.size === questions.length ? 'Deselect All' : 'Select All'}</Button>
              <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            </div>
            <Button onClick={publishSelected} disabled={selected.size === 0 || publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}Publish Selected
            </Button>
          </div>
          <div className="space-y-3">
            {questions.map(q => (
              <Card key={q._id} className={`cursor-pointer transition-all ${selected.has(q._id) ? 'ring-2 ring-primary' : ''}`} onClick={() => toggleSelect(q._id)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.has(q._id)} onChange={() => toggleSelect(q._id)} className="mt-1 accent-primary" onClick={e => e.stopPropagation()} />
                    <div className="flex-1">
                      <p className="font-medium">{q.questionText}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{q.subject}</span>
                        <span className="px-2 py-0.5 bg-muted text-xs rounded">{q.topic}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${q.difficulty === 'easy' ? 'bg-accent/10 text-accent' : q.difficulty === 'hard' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>{q.difficulty}</span>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {q.options?.map((o: string, i: number) => (
                          <span key={i} className={`mr-3 ${i === q.correctOptionIndex ? 'text-accent font-medium' : ''}`}>{String.fromCharCode(65 + i)}. {o}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
