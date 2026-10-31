import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err: any) { setError(err.response?.data?.message || t('auth.requestFailed')); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <LanguageSwitcher floating />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <span className="text-4xl">🌍</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('brand.name')}</span>
          </Link>
        </div>
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{sent ? t('auth.checkEmailTitle') : t('auth.forgotTitle')}</CardTitle>
            <CardDescription>{sent ? t('auth.checkEmailSubtitle') : t('auth.forgotSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-accent mx-auto" />
                <p className="text-muted-foreground">{t('auth.checkInbox')}</p>
                <Link to="/login"><Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />{t('auth.backToLoginButton')}</Button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}
                <div className="space-y-2">
                  <Label>{t('auth.email')}</Label>
                  <div className="relative"><Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input type="email" placeholder={t('auth.emailPlaceholder')} className="pl-10" {...register('email', { required: true })} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{t('auth.sendResetLink')}
                </Button>
                <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="inline h-3 w-3 mr-1" />{t('auth.backToLoginLink')}</Link>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
