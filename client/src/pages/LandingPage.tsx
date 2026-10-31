import { Link } from 'react-router-dom';
import { GuestButton } from '@/components/GuestButton';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Trophy, BarChart3, Clock, Users, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/lib/i18n';
import { sinhalaQuestions } from '@/data/sinhalaQuestions';
import { guestTests } from '@/data/guestTests';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useT();

  const features = [
    { icon: BookOpen, title: t('landing.feat.practice.title'), desc: t('landing.feat.practice.desc'), color: 'from-blue-500 to-indigo-600' },
    { icon: Clock, title: t('landing.feat.timed.title'), desc: t('landing.feat.timed.desc'), color: 'from-emerald-500 to-green-600' },
    { icon: Brain, title: t('landing.feat.analytics.title'), desc: t('landing.feat.analytics.desc'), color: 'from-violet-500 to-purple-600' },
    { icon: Trophy, title: t('landing.feat.leaderboards.title'), desc: t('landing.feat.leaderboards.desc'), color: 'from-amber-500 to-orange-600' },
    { icon: Zap, title: t('landing.feat.xp.title'), desc: t('landing.feat.xp.desc'), color: 'from-rose-500 to-pink-600' },
    { icon: Users, title: t('landing.feat.social.title'), desc: t('landing.feat.social.desc'), color: 'from-cyan-500 to-teal-600' },
  ];

  const stats = [
    { value: String(sinhalaQuestions.length), label: t('landing.stat.questions') },
    { value: String(guestTests.length), label: t('landing.stat.papers') },
    { value: String(new Set(sinhalaQuestions.map((q) => q.topic)).size), label: t('landing.stat.categories') },
    { value: '∞', label: t('landing.stat.sessions') },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-2xl">🌍</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('brand.name')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Link to="/dashboard"><Button>{t('landing.goDashboard')}<ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">{t('landing.signIn')}</Button></Link>
                <Link to="/register"><Button>{t('landing.getStarted')}<ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 md:py-32 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />{t('landing.badge')}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              {t('landing.heroTitle1')}{' '}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent">
                {t('landing.heroTitle2')}
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <GuestButton size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-indigo-600 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                {t('landing.startFree')}<ArrowRight className="h-5 w-5 ml-2" />
              </GuestButton>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">{t('landing.signIn')}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.value} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{t('landing.featuresTitle1')} <span className="text-primary">{t('landing.featuresTitle2')}</span></h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t('landing.featuresSubtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.color} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary to-indigo-600 p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{t('landing.cta.title')}</h2>
            <p className="text-white/80 mt-3 max-w-lg mx-auto">{t('landing.cta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[t('landing.cta.free'), t('landing.cta.noAds'), t('landing.cta.allCategories')].map((label, i) => (
                <span key={i} className="flex items-center gap-1.5 text-white/90 text-sm"><CheckCircle className="h-4 w-4" />{label}</span>
              ))}
            </div>
            <Link to="/register"><Button size="lg" className="mt-8 bg-white text-primary hover:bg-white/90 text-lg px-8">{t('landing.cta.createAccount')}</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><span className="text-xl">🌍</span><span className="font-bold text-primary">{t('brand.name')}</span></div>
          <p className="text-sm text-muted-foreground">{t('landing.footer', { year: new Date().getFullYear(), brand: t('brand.name') })}</p>
        </div>
      </footer>
    </div>
  );
}
