import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  // Form state
  const [form, setForm] = useState({ subject: '', topic: '', subtopic: '', difficulty: 'medium', questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', conceptSummary: '', isPublished: false });

  const fetchQuestions = () => {
    setLoading(true);
    api.get('/questions', { params: { page, limit: 10 } }).then(r => { setQuestions(r.data.questions); setPagination(r.data.pagination); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(); }, [page]);

  const resetForm = () => setForm({ subject: '', topic: '', subtopic: '', difficulty: 'medium', questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, explanation: '', conceptSummary: '', isPublished: false });

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, options: form.options.filter(o => o.trim()) };
      if (editing) { await api.put(`/questions/${editing._id}`, data); }
      else { await api.post('/questions', data); }
      setShowForm(false); setEditing(null); resetForm(); fetchQuestions();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try { await api.delete(`/questions/${id}`); fetchQuestions(); } catch {}
  };

  const startEdit = (q: any) => {
    setForm({ subject: q.subject, topic: q.topic, subtopic: q.subtopic || '', difficulty: q.difficulty, questionText: q.questionText,
      options: [...q.options, ...Array(4 - q.options.length).fill('')].slice(0, 4), correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || '', conceptSummary: q.conceptSummary || '', isPublished: q.isPublished });
    setEditing(q); setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="h-8 w-8 text-primary" />Question Management</h1>
        </motion.div>
        <Button onClick={() => { resetForm(); setEditing(null); setShowForm(!showForm); }}>
          {showForm ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Plus className="h-4 w-4 mr-2" />Add Question</>}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card><CardHeader><CardTitle>{editing ? 'Edit Question' : 'New Question'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1"><Label>Subject</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Physiology" /></div>
                <div className="space-y-1"><Label>Topic</Label><Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="Cell Physiology" /></div>
                <div className="space-y-1"><Label>Subtopic</Label><Input value={form.subtopic} onChange={e => setForm(f => ({ ...f, subtopic: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Difficulty</Label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select></div>
              </div>
              <div className="space-y-1"><Label>Question Text</Label>
                <textarea value={form.questionText} onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                  className="flex w-full rounded-lg border border-input bg-background px-4 py-2 text-sm min-h-[80px]" /></div>
              <div className="space-y-2"><Label>Options</Label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={form.correctOptionIndex === i} onChange={() => setForm(f => ({ ...f, correctOptionIndex: i }))} className="accent-primary" />
                    <Input value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm(f => ({ ...f, options: o })); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer</p>
              </div>
              <div className="space-y-1"><Label>Explanation</Label>
                <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} className="flex w-full rounded-lg border border-input bg-background px-4 py-2 text-sm min-h-[60px]" /></div>
              <div className="space-y-1"><Label>Concept Summary</Label>
                <Input value={form.conceptSummary} onChange={e => setForm(f => ({ ...f, conceptSummary: e.target.value }))} /></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="accent-primary" /><span className="text-sm">Publish immediately</span></label>
              <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}{editing ? 'Update' : 'Create'} Question</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Questions List */}
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div> : questions.length === 0 ?
        <Card><CardContent className="p-12 text-center"><BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold">No questions found</h3></CardContent></Card>
      : (
        <div className="space-y-3">
          {questions.map(q => (
            <Card key={q._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2">{q.questionText}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">{q.subject}</span>
                      <span className="px-2 py-0.5 bg-muted text-xs rounded">{q.topic}</span>
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${q.difficulty === 'easy' ? 'bg-accent/10 text-accent' : q.difficulty === 'hard' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>{q.difficulty}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${q.isPublished ? 'bg-accent/10 text-accent' : 'bg-amber-500/10 text-amber-500'}`}>{q.isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(q)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(q._id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center text-sm text-muted-foreground">Page {page} of {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
