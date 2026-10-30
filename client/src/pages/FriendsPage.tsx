import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get('/friends').then(r => { setFriends(r.data.friends); setPending(r.data.pendingRequests); }).finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try { const r = await api.get('/friends/search', { params: { q: searchQuery } }); setSearchResults(r.data.users); }
    catch {} finally { setSearching(false); }
  };

  const sendRequest = async (recipientId: string) => {
    try { await api.post('/friends/request', { recipientId }); setSearchResults(r => r.filter(u => u._id !== recipientId)); } catch (e: any) { alert(e.response?.data?.message || 'Failed'); }
  };

  const acceptRequest = async (friendshipId: string) => {
    try { await api.post('/friends/accept', { friendshipId }); setPending(p => p.filter(r => r._id !== friendshipId));
      const r = await api.get('/friends'); setFriends(r.data.friends); } catch {}
  };

  const rejectRequest = async (friendshipId: string) => {
    try { await api.post('/friends/reject', { friendshipId }); setPending(p => p.filter(r => r._id !== friendshipId)); } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8 text-primary" />Friends</h1>
        <p className="text-muted-foreground mt-1">Connect with fellow medical students</p>
      </motion.div>

      {/* Search */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Find Friends</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search by name, username, or email" className="pl-10" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map(u => (
                <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">{u.name?.charAt(0)}</div>
                    <div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">@{u.username}</p></div>
                  </div>
                  <Button size="sm" onClick={() => sendRequest(u._id)}><UserPlus className="h-4 w-4 mr-1" />Add</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Pending Requests ({pending.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pending.map(r => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">{r.requesterId?.name?.charAt(0)}</div>
                  <div><p className="font-medium">{r.requesterId?.name}</p><p className="text-xs text-muted-foreground">@{r.requesterId?.username}</p></div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => acceptRequest(r._id)} className="bg-accent hover:bg-accent/90"><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => rejectRequest(r._id)}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Your Friends ({friends.length})</CardTitle></CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8"><Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No friends yet. Search and connect!</p></div>
          ) : (
            <div className="space-y-2">
              {friends.map(f => (
                <div key={f._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">{f.name?.charAt(0)}</div>
                    <div><p className="font-medium">{f.name}</p><p className="text-xs text-muted-foreground">@{f.username}{f.college ? ` • ${f.college}` : ''}</p></div>
                  </div>
                  <span className="text-sm font-bold text-primary">{f.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
