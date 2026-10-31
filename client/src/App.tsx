import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, lazy, Suspense } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useLangStore } from '@/lib/i18n';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Eagerly load the landing & auth pages (first paint)
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// Lazy-load everything else for code-splitting
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PracticePage = lazy(() => import('@/pages/PracticePage'));
const PapersPage = lazy(() => import('@/pages/PapersPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const FriendsPage = lazy(() => import('@/pages/FriendsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const AdminQuestionsPage = lazy(() => import('@/pages/AdminQuestionsPage'));
const AdminImportPage = lazy(() => import('@/pages/AdminImportPage'));
const AdminReviewPage = lazy(() => import('@/pages/AdminReviewPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return <>{children}</>;
}

function LangInitializer({ children }: { children: React.ReactNode }) {
  const { lang } = useLangStore();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer>
        <LangInitializer>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/papers" element={<PapersPage />} />
                <Route path="/quiz" element={<Navigate to="/practice" />} />
                <Route path="/results/:id" element={<ResultsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/leaderboards" element={<LeaderboardPage />} />
                <Route path="/friends" element={<FriendsPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/questions" element={<AdminQuestionsPage />} />
                <Route path="/admin/import" element={<AdminImportPage />} />
                <Route path="/admin/review" element={<AdminReviewPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </LangInitializer>
      </ThemeInitializer>
    </QueryClientProvider>
  );
}
