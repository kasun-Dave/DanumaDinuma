import { Languages } from 'lucide-react';
import { useLangStore, useT } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { buildGuestUser } from '@/lib/guestStore';

// Toggles Sinhala <-> English. `floating` pins it to the top-right corner (auth pages).
export function LanguageSwitcher({ floating = false }: { floating?: boolean }) {
  const toggleLang = useLangStore((s) => s.toggleLang);
  const { t } = useT();

  const handleClick = () => {
    toggleLang();
    // A guest's default display name ("Guest" / "අමුත්තා") follows the language.
    const { isGuest, setUser } = useAuthStore.getState();
    if (isGuest) setUser(buildGuestUser());
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={t('lang.switchTitle')}
      className={`inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:bg-muted ${floating ? 'fixed right-4 top-4 z-50' : ''}`}
    >
      <Languages className="h-4 w-4" />
      {t('lang.switch')}
    </button>
  );
}
