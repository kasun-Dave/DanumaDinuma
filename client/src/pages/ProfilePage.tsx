import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [year, setYear] = useState(user?.year || 1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true); setSuccess(false);
    try {
      const res = await api.put('/auth/profile', { name, college, year, theme });
      setUser(res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><User className="h-8 w-8 text-primary" />Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </motion.div>

      {/* Avatar */}
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-muted-foreground">@{user?.username}</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-primary font-bold">{user?.xp} XP</span>
              <span className="text-accent font-bold">🔥 {user?.streak} day streak</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>College</Label>
            <Input value={college} onChange={e => setCollege(e.target.value)} placeholder="Your medical college" />
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm">
              {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-3">
              <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => { if (theme !== 'light') toggleTheme(); }}>☀️ Light</Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => { if (theme !== 'dark') toggleTheme(); }}>🌙 Dark</Button>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {success ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Badges */}
      {user?.badges && user.badges.length > 0 && (
        <Card>
          <CardHeader><CardTitle>🏅 Your Badges</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {user.badges.map((b: any) => (
                <div key={b._id || b} className="p-3 rounded-xl bg-muted/50 text-center">
                  <span className="text-2xl">{b.icon || '🏅'}</span>
                  <p className="text-sm font-medium mt-1">{b.name || 'Badge'}</p>
                  <p className="text-xs text-muted-foreground">{b.description || ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
