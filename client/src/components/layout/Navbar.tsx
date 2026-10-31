import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/lib/i18n';
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard, BookOpen, BarChart3, Bookmark, Trophy, Users, Shield, FileText } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

const studentLinks = [
  { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/practice', label: 'nav.practice', icon: BookOpen },
  { to: '/papers', label: 'nav.papers', icon: FileText, guestOnly: true },
  { to: '/analytics', label: 'nav.analytics', icon: BarChart3 },
  { to: '/bookmarks', label: 'nav.bookmarks', icon: Bookmark },
  { to: '/leaderboards', label: 'nav.leaderboard', icon: Trophy, accountOnly: true },
  { to: '/friends', label: 'nav.friends', icon: Users, accountOnly: true },
];

const adminLinks = [
  { to: '/admin', label: 'nav.adminPanel', icon: Shield },
  { to: '/admin/questions', label: 'nav.adminQuestions', icon: BookOpen },
  { to: '/admin/import', label: 'nav.adminImport', icon: BookOpen },
];

export default function Navbar() {
  const { user, isGuest, logout: logoutStore } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logoutStore();
    navigate('/login');
  };

  // Guests only see what works without an account; Papers are guest-mode content.
  const memberLinks = studentLinks.filter((l) => (isGuest ? !l.accountOnly : !l.guestOnly));
  const links = user?.role === 'admin' ? [...memberLinks, ...adminLinks] : memberLinks;
  const displayName = user?.name || t('guest.name');

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 whitespace-nowrap text-xl font-bold">
            <span className="text-2xl">🌍</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('brand.name')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                <Icon className="h-4 w-4" />
                {t(label)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user && (
              <div className="hidden xl:flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                    {displayName.charAt(0)}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{t('nav.xp', { n: user.xp })}</p>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title={isGuest ? t('nav.exitGuest') : t('nav.logout')} className="rounded-full text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="xl:hidden border-t py-4 space-y-1 animate-fade-in">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Icon className="h-5 w-5" />
                {t(label)}
              </Link>
            ))}
            {user && (
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full">
                <LogOut className="h-5 w-5" />
                {isGuest ? t('nav.exitGuest') : t('nav.logout')}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
