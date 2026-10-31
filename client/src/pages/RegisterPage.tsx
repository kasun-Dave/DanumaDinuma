import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { GuestButton } from '@/components/GuestButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/lib/i18n';
import api from '@/lib/api';

interface RegisterForm { name: string; username: string; email: string; password: string; }

export default function RegisterPage() {
  const { t } = useT();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register', data);
      setAuth(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || t('auth.registerFailed'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <LanguageSwitcher floating />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <span className="text-4xl">🌍</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('brand.name')}</span>
          </Link>
          <p className="text-muted-foreground mt-2">{t('auth.registerTagline')}</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-accent/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.createAccount')}</CardTitle>
            <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

              <div className="space-y-2">
                <Label>{t('auth.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input placeholder={t('auth.namePlaceholder')} className="pl-10" {...reg('name', { required: t('auth.nameRequired'), minLength: { value: 2, message: t('auth.nameMin') } })} />
                </div>
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t('auth.username')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">@</span>
                  <Input placeholder={t('auth.usernamePlaceholder')} className="pl-8" {...reg('username', { required: t('auth.usernameRequired'), minLength: { value: 3, message: t('auth.usernameMin') }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: t('auth.usernamePattern') } })} />
                </div>
                {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input type="email" placeholder={t('auth.emailPlaceholder')} className="pl-10" {...reg('email', { required: t('auth.emailRequired') })} />
                </div>
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.passwordPlaceholder')} className="pl-10 pr-10"
                    {...reg('password', { required: t('auth.passwordRequired'), minLength: { value: 8, message: t('auth.passwordMin') }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, message: t('auth.passwordPattern') } })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')} className="absolute right-3 top-3 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('auth.createAccount')}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{t('common.or')}</span></div>
            </div>
            <GuestButton variant="outline" className="w-full">{t('guest.continue')}</GuestButton>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t('auth.haveAccount')} <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.signInLink')}</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
