import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Upload, FileJson, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

export default function AdminImportPage() {
  const [tab, setTab] = useState<'pdf' | 'json'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('Physiology');
  const [topic, setTopic] = useState('General');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [jsonText, setJsonText] = useState('');

  const uploadPdf = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subject', subject);
    formData.append('topic', topic);
    try {
      const res = await api.post('/admin/pdf-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data.parsed);
    } catch (err: any) { setResult({ error: err.response?.data?.message || 'Upload failed' }); }
    finally { setLoading(false); }
  };

  const importJson = async () => {
    setLoading(true); setResult(null);
    try {
      const questions = JSON.parse(jsonText);
      const res = await api.post('/admin/import-json', { questions: Array.isArray(questions) ? questions : [questions] });
      setResult({ success: true, message: res.data.message });
    } catch (err: any) { setResult({ error: err.response?.data?.message || err.message || 'Import failed' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><FileUp className="h-8 w-8 text-primary" />Import Questions</h1>
        <p className="text-muted-foreground mt-1">Upload PDF or import JSON to add questions in bulk</p>
      </motion.div>

      <div className="flex gap-2">
        <Button variant={tab === 'pdf' ? 'default' : 'outline'} onClick={() => { setTab('pdf'); setResult(null); }}><Upload className="h-4 w-4 mr-2" />PDF Upload</Button>
        <Button variant={tab === 'json' ? 'default' : 'outline'} onClick={() => { setTab('json'); setResult(null); }}><FileJson className="h-4 w-4 mr-2" />JSON Import</Button>
      </div>

      {tab === 'pdf' ? (
        <Card>
          <CardHeader><CardTitle>Upload MCQ PDF</CardTitle><CardDescription>Upload a PDF with MCQs. The parser will extract questions, options, and answers.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
              <div className="space-y-1"><Label>Topic</Label><Input value={topic} onChange={e => setTopic(e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>PDF File</Label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('pdf-input')?.click()}>
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">{file ? file.name : 'Click to select PDF'}</p>
                <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
                <input id="pdf-input" type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <Button onClick={uploadPdf} disabled={!file || loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}Parse PDF
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Import JSON</CardTitle><CardDescription>Paste question JSON array. Each object needs: subject, topic, questionText, options, correctOptionIndex</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} placeholder='[{"subject":"Physiology","topic":"Cell","questionText":"...","options":["A","B","C","D"],"correctOptionIndex":0}]'
              className="flex w-full rounded-lg border border-input bg-background px-4 py-2 text-sm font-mono min-h-[200px]" />
            <Button onClick={importJson} disabled={!jsonText.trim() || loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileJson className="h-4 w-4 mr-2" />}Import Questions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {result.error ? (
            <Card className="border-destructive/30"><CardContent className="p-4 flex items-center gap-3"><AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" /><p className="text-destructive">{result.error}</p></CardContent></Card>
          ) : result.success ? (
            <Card className="border-accent/30"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-accent flex-shrink-0" /><p className="text-accent font-medium">{result.message}</p></CardContent></Card>
          ) : result.questions ? (
            <Card>
              <CardHeader><CardTitle>Parse Results</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-primary/10"><p className="text-2xl font-bold text-primary">{result.insertedCount !== undefined ? result.insertedCount : result.uniqueCount}</p><p className="text-xs text-muted-foreground">Inserted</p></div>
                  <div className="p-3 rounded-lg bg-accent/10"><p className="text-2xl font-bold text-accent">{result.uniqueCount}</p><p className="text-xs text-muted-foreground">Unique</p></div>
                  <div className="p-3 rounded-lg bg-amber-500/10"><p className="text-2xl font-bold text-amber-500">{result.duplicateCount}</p><p className="text-xs text-muted-foreground">Duplicates</p></div>
                  <div className="p-3 rounded-lg bg-destructive/10"><p className="text-2xl font-bold text-destructive">{result.errors?.length || 0}</p><p className="text-xs text-muted-foreground">Errors</p></div>
                </div>
                {result.questions.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.questions.map((q: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm"><p className="font-medium">{q.questionText?.substring(0, 100)}...</p>
                        <p className="text-xs text-muted-foreground mt-1">{q.options?.length} options • Answer: {String.fromCharCode(65 + (q.correctOptionIndex || 0))}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}
