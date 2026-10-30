import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Search, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

export default function BookmarksPage() {
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
        <h1 className="text-3xl font-bold flex items-center gap-2"><Bookmark className="h-8 w-8 text-amber-500" />Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Your saved questions for review</p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search bookmarks..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : bookmarks.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <Bookmark className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No bookmarks yet</h3>
          <p className="text-muted-foreground mt-1">Bookmark questions during quizzes to review them later</p>
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
                        {b.questionId?.subject && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">{b.questionId.subject}</span>}
                        {b.questionId?.topic && <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md">{b.questionId.topic}</span>}
                        {b.questionId?.difficulty && <span className={`px-2 py-0.5 text-xs rounded-md font-medium
                          ${b.questionId.difficulty === 'easy' ? 'bg-accent/10 text-accent' : b.questionId.difficulty === 'hard' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>{b.questionId.difficulty}</span>}
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p><strong>Answer:</strong> {b.questionId?.options?.[b.questionId.correctOptionIndex]}</p>
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
