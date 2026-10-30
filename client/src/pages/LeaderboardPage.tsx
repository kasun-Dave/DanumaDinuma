import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, GraduationCap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'global' | 'college' | 'friends'>('global');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard/${tab}`).then(r => setLeaderboard(r.data.leaderboard)).catch(console.error).finally(() => setLoading(false));
  }, [tab]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-amber-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="h-6 w-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Trophy className="h-8 w-8 text-amber-500" />Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Compete with fellow medical students</p>
      </motion.div>

      <div className="flex gap-2">
        {([['global', 'Global', Trophy], ['college', 'College', GraduationCap], ['friends', 'Friends', Users]] as const).map(([key, label, Icon]) => (
          <Button key={key} variant={tab === key ? 'default' : 'outline'} onClick={() => setTab(key)} className="flex-1">
            <Icon className="h-4 w-4 mr-2" />{label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No data yet</h3>
              <p className="text-muted-foreground">{tab === 'college' ? 'Set your college in profile' : tab === 'friends' ? 'Add friends to see their ranking' : 'Start earning XP!'}</p>
            </div>
          ) : (
            <div className="divide-y">
              {leaderboard.map((entry, i) => (
                <motion.div key={entry._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${entry._id === user?._id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                  <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {entry.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.name}{entry._id === user?._id && <span className="text-xs text-primary ml-1">(You)</span>}</p>
                    <p className="text-xs text-muted-foreground">@{entry.username}{entry.college ? ` • ${entry.college}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary">{entry.xp} XP</p>
                    {entry.streak > 0 && <p className="text-xs text-muted-foreground">🔥 {entry.streak}d streak</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
