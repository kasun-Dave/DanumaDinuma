import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Search, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { useT, useCatLabel } from '@/lib/i18n';

export default function BookmarksPage() {
  const { t } = useT();
  const catLabel = useCatLabel();
  const diffLabel = (d: string) => (['easy', 'medium', 'hard'].includes(d) ? t(`bookmarks.diff.${d}`) : d);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    setLoading(true);
    api.get('/bookmarks', { params: { search } }).then(r => setBookmarks(r.data.bookmarks)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookmarks(); }, [search]);

  const removeBookmark = async (id: string) => {
    try { await api.delete(`/bookmarks/${id}`); setBookmarks(b => b.filter(x => x._id !== id)); } catch {}
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Bookmark className="h-8 w-8 text-amber-500" />{t('nav.bookmarks')}</h1>
        <p className="text-muted-foreground mt-1">{t('bookmarks.subtitle')}</p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input placeholder={t('bookmarks.searchPlaceholder')} className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : bookmarks.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <Bookmark className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">{t('bookmarks.emptyTitle')}</h3>
          <p className="text-muted-foreground mt-1">{t('bookmarks.emptyText')}</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{b.questionId?.questionText}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {b.questionId?.subject && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">{catLabel(b.questionId.subject)}</span>}
                        {b.questionId?.topic && <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md">{catLabel(b.questionId.topic)}</span>}
                        {b.questionId?.difficulty && <span className={`px-2 py-0.5 text-xs rounded-md font-medium
                          ${b.questionId.difficulty === 'easy' ? 'bg-accent/10 text-accent' : b.questionId.difficulty === 'hard' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>{diffLabel(b.questionId.difficulty)}</span>}
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p><strong>{t('bookmarks.answer')}</strong> {b.questionId?.options?.[b.questionId.correctOptionIndex]}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeBookmark(b._id)}>
                      <Trash2 className="h-4 w-4" />
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
