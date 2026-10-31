import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Zap, Filter, Play, ChevronRight, ChevronLeft, CheckCircle, XCircle, Bookmark, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { useT, useCatLabel } from '@/lib/i18n';

export default function PracticePage() {
  const { t } = useT();
  const catLabel = useCatLabel();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // ?paper=<id>: start that paper's quiz straight away (no config screen)
  const paperId = searchParams.get('paper');
  const paperStartedFor = useRef<string | null>(null);
  const [paperFailed, setPaperFailed] = useState(false);
  const [step, setStep] = useState<'config' | 'quiz'>('config');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Config state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [timed, setTimed] = useState(!paperId && searchParams.get('mode') === 'timed');
  const [timeLimit, setTimeLimit] = useState(30);
  const [negativeMarking, setNegativeMarking] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/questions/subjects').then(r => setSubjects(r.data.subjects)).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Timer
  useEffect(() => {
    if (!timed || step !== 'quiz' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(s => { if (s <= 1) { handleSubmit(); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [timed, step, timeLeft]);

  // Create a quiz from the given request body and open it. Returns true on success.
  const createQuiz = async (body: Record<string, unknown>, isTimed: boolean, minutes: number): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.post('/quiz/create', body);
      setQuiz(res.data.quiz);
      setQuestions(res.data.quiz.questions);
      setCurrentIdx(0);
      setAnswers(new Map());
      setStep('quiz');
      if (isTimed) setTimeLeft(minutes * 60);
      return true;
    } catch (err: any) { alert(err.response?.data?.message || t('practice.createFailed')); return false; }
    finally { setLoading(false); }
  };

  const startQuiz = () => createQuiz({
    type: timed ? 'timed' : 'practice', subject: selectedSubject,
    topics: selectedTopics, difficulty, questionCount,
    timeLimit: timed ? timeLimit : 0, negativeMarking,
  }, timed, timeLimit);

  // Paper link: start immediately, once (the ref also guards against React StrictMode's double effect run)
  useEffect(() => {
    if (!paperId || paperStartedFor.current === paperId) return;
    paperStartedFor.current = paperId;
    setPaperFailed(false);
    createQuiz({ type: 'practice', testId: paperId, questionCount: 10, topics: [], difficulty: 'mixed', subject: '' }, false, 0)
      .then(ok => { if (!ok) setPaperFailed(true); });
  }, [paperId]);

  const selectAnswer = (optionIdx: number) => {
    const q = questions[currentIdx];
    const newAnswers = new Map(answers);
    newAnswers.set(q._id, optionIdx);
    setAnswers(newAnswers);
    if (!timed) setShowExplanation(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answerArray = questions.map(q => ({
        questionId: q._id, selectedOptionIndex: answers.get(q._id) ?? -1, timeTaken: 0,
      }));
      const res = await api.post('/quiz/submit', { quizId: quiz._id, answers: answerArray });
      navigate(`/results/${quiz._id}`, { state: { result: res.data.result } });
    } catch (err) { console.error(err); alert(t('practice.submitFailed')); }
    finally { setSubmitting(false); }
  };

  const toggleBookmark = async (questionId: string) => {
    try {
      await api.post('/bookmarks/toggle', { questionId });
      setBookmarked(prev => { const n = new Set(prev); n.has(questionId) ? n.delete(questionId) : n.add(questionId); return n; });
    } catch {}
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (step === 'config') {
    // Opened from a paper link: show the loading state until the quiz is ready (config screen only if creation failed)
    if (paperId && !paperFailed) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">{t('common.loading')}</span>
        </div>
      );
    }
    const availableTopics = subjects.find(s => s._id === selectedSubject)?.topics || [];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-2">{timed ? <Clock className="h-8 w-8 text-primary" /> : <BookOpen className="h-8 w-8 text-primary" />}{timed ? t('practice.timedTitle') : t('practice.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('practice.configure')}</p>
        </motion.div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-3">
              <Button variant={!timed ? 'default' : 'outline'} onClick={() => setTimed(false)} className="flex-1"><BookOpen className="h-4 w-4 mr-2" />{t('practice.modePractice')}</Button>
              <Button variant={timed ? 'default' : 'outline'} onClick={() => setTimed(true)} className="flex-1"><Clock className="h-4 w-4 mr-2" />{t('practice.modeTimed')}</Button>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('practice.subject')}</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setSelectedSubject(''); setSelectedTopics([]); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!selectedSubject ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>{t('practice.allSubjects')}</button>
                {subjects.map(s => (
                  <button key={s._id} onClick={() => { setSelectedSubject(s._id); setSelectedTopics([]); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSubject === s._id ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>{catLabel(s._id)} ({s.count})</button>
                ))}
              </div>
            </div>

            {/* Topics */}
            {availableTopics.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('practice.topics')}</label>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic: string) => (
                    <button key={topic} onClick={() => setSelectedTopics(p => p.includes(topic) ? p.filter(x => x !== topic) : [...p, topic])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTopics.includes(topic) ? 'bg-accent text-white' : 'bg-muted hover:bg-muted/80'}`}>{catLabel(topic)}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('practice.difficulty')}</label>
              <div className="flex gap-2">
                {['mixed', 'easy', 'medium', 'hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${difficulty === d ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>{t(`practice.diff.${d}`)}</button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('practice.questionCount', { n: questionCount })}</label>
              <input type="range" min="5" max="200" step="5" value={questionCount} onChange={e => setQuestionCount(+e.target.value)}
                className="w-full accent-primary" />
            </div>

            {/* Timed options */}
            {timed && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('practice.timeLimit', { n: timeLimit })}</label>
                  <input type="range" min="5" max="120" step="5" value={timeLimit} onChange={e => setTimeLimit(+e.target.value)} className="w-full accent-primary" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={negativeMarking} onChange={e => setNegativeMarking(e.target.checked)} className="h-4 w-4 accent-primary" />
                  <span className="text-sm font-medium">{t('practice.negativeMarking')}</span>
                </label>
              </>
            )}

            <Button onClick={startQuiz} className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}{t('practice.startQuiz')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz mode
  const currentQ = questions[currentIdx];
  const selectedAnswer = answers.get(currentQ?._id);
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQ?.correctOptionIndex;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('practice.questionOf', { n: currentIdx + 1, total: questions.length })}</h2>
        <div className="flex items-center gap-3">
          {timed && <div className={`px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 60 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted'}`}>{formatTime(timeLeft)}</div>}
          <Button variant="ghost" size="icon" onClick={() => toggleBookmark(currentQ._id)} className={bookmarked.has(currentQ._id) ? 'text-amber-500' : ''}>
            <Bookmark className="h-5 w-5" fill={bookmarked.has(currentQ._id) ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </div>

      <Progress value={((currentIdx + 1) / questions.length) * 100} />

      {/* Question Palette */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button key={q._id} onClick={() => { setCurrentIdx(i); setShowExplanation(false); }}
            className={`h-8 w-8 rounded-md text-xs font-bold transition-all
              ${i === currentIdx ? 'bg-primary text-white scale-110' : answers.has(q._id) ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-muted text-muted-foreground'}`}>{i + 1}</button>
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <Card className="border-2">
            <CardContent className="p-6">
              {currentQ.topic && (
                <div className="mb-3">
                  <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{catLabel(currentQ.topic)}</span>
                </div>
              )}
              <p className="text-lg font-medium mb-6 leading-relaxed break-words">{currentQ.questionText}</p>
              <div className="space-y-3">
                {currentQ.options.map((opt: string, i: number) => {
                  let optClass = 'border-2 border-muted hover:border-primary/50 hover:bg-primary/5';
                  if (isAnswered && !timed) {
                    if (i === currentQ.correctOptionIndex) optClass = 'border-2 border-accent bg-accent/10';
                    else if (i === selectedAnswer && !isCorrect) optClass = 'border-2 border-destructive bg-destructive/10';
                    else optClass = 'border-2 border-muted opacity-50';
                  } else if (i === selectedAnswer) {
                    optClass = 'border-2 border-primary bg-primary/10';
                  }
                  return (
                    <button key={i} onClick={() => !isAnswered || timed ? selectAnswer(i) : null}
                      className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${optClass}`}
                      disabled={isAnswered && !timed}>
                      <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1 min-w-0 break-words">{opt}</span>
                      {isAnswered && !timed && i === currentQ.correctOptionIndex && <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />}
                      {isAnswered && !timed && i === selectedAnswer && !isCorrect && <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && currentQ.explanation && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 rounded-xl bg-muted/50 border">
                  <h4 className="font-semibold text-sm mb-2 text-primary">💡 {t('practice.explanation')}</h4>
                  <p className="text-sm text-muted-foreground break-words">{currentQ.explanation}</p>
                  {currentQ.conceptSummary && <p className="text-sm mt-2 font-medium break-words">📌 {currentQ.conceptSummary}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setShowExplanation(false); }} disabled={currentIdx === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" />{t('practice.previous')}
        </Button>
        <div className="flex gap-2">
          {currentIdx < questions.length - 1 ? (
            <Button onClick={() => { setCurrentIdx(i => i + 1); setShowExplanation(false); }}>{t('practice.next')}<ChevronRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-accent to-emerald-600">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{t('practice.submitQuiz')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
