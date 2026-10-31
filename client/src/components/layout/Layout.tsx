import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuthStore } from '@/stores/authStore';
import { useT } from '@/lib/i18n';

export default function Layout() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const { t } = useT();
  return (
    <div className="min-h-screen bg-background">
      {isGuest && (
        <div className="bg-primary/10 text-primary text-center text-xs sm:text-sm py-1.5 px-4">
          {t('guest.banner')}
        </div>
      )}
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
