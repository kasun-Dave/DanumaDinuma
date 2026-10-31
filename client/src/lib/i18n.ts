import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Lightweight i18n: Sinhala (default) and English. Every file in src/i18n/*.ts exports
// `default { en: {...}, si: {...} }` with flat keys; they are merged here automatically.

export type Lang = 'si' | 'en';
type Dict = Record<string, string>;
type Namespace = { en: Dict; si: Dict };

const modules = import.meta.glob<{ default: Namespace }>('../i18n/*.ts', { eager: true });
const messages: Record<Lang, Dict> = { en: {}, si: {} };
for (const m of Object.values(modules)) {
  Object.assign(messages.en, m.default.en);
  Object.assign(messages.si, m.default.si);
}

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'si',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'si' ? 'en' : 'si' }),
    }),
    { name: 'danumadinuma-lang' }
  )
);

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let text = messages[lang][key] ?? messages.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
  return text;
}

/** React hook: `const { t } = useT(); t('nav.dashboard')`, `t('results.score', { n: 5 })`. */
export function useT(): { t: TFunction; lang: Lang } {
  const lang = useLangStore((s) => s.lang);
  return { t: (key, vars) => translate(lang, key, vars), lang };
}

/** Display name of a subject, topic or category as stored in the data (falls back to the stored text). */
export function useCatLabel(): (value: string) => string {
  const lang = useLangStore((s) => s.lang);
  return (value) => messages[lang][`cat.${value}`] ?? value;
}
