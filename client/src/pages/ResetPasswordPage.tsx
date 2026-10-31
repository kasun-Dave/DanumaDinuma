import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const { t } = useT();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<{ password: string }>();

  const onSubmit = async (data: { password: string }) => {
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) { setError(err.response?.data?.message || t('auth.resetFailed')); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <LanguageSwitcher floating />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <span className="text-4xl">🌍</span><span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('brand.name')}</span>
          </Link>
        </div>
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{done ? t('auth.resetDoneTitle') : t('auth.setNewPassword')}</CardTitle>
            <CardDescription>{done ? t('auth.redirecting') : t('auth.createStrong')}</CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center"><CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" /><p className="text-muted-foreground">{t('auth.resetSuccess')}</p></div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
                <div className="space-y-2">
                  <Label>{t('auth.newPassword')}</Label>
                  <div className="relative"><Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input type="password" placeholder={t('auth.newPasswordPlaceholder')} className="pl-10"
                      {...register('password', { required: t('auth.required'), minLength: { value: 8, message: t('auth.minChars8') },
                        pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, message: t('auth.passwordPattern') } })} />
                  </div>
                  {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{t('auth.resetPassword')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
