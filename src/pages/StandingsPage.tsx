import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StandingsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [season, setSeason] = useState<any>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const load = async () => {
      const m = (localStorage.getItem('app_members') && JSON.parse(localStorage.getItem('app_members') as string)) || [];
      const c = (localStorage.getItem('app_challenges') && JSON.parse(localStorage.getItem('app_challenges') as string)) || [];
      const seasons = (localStorage.getItem('app_seasons') && JSON.parse(localStorage.getItem('app_seasons') as string)) || [];
      const seasonId = parseInt(searchParams.get('seasonId') || '1');
      setSeason(seasons.find((s: any) => s.id === seasonId) || seasons[0] || null);
      setMembers(m);
      setChallenges(c);
    };
    load();
  }, [searchParams]);

  const table = useMemo(() => {
    const seasonId = season?.id;
    const stats: Record<number, { wins: number; losses: number; name: string }> = {};
    members.forEach((m) => { stats[m.id] = { wins: m.wins || 0, losses: m.losses || 0, name: m.name || `Member #${m.id}` }; });
    (challenges || [])
      .filter((c: any) => c.season_id ? c.season_id === seasonId : true)
      .filter((c: any) => c.verification_status === 'Verified')
      .forEach((c: any) => {
        if (!stats[c.winner_member_id]) stats[c.winner_member_id] = { wins: 0, losses: 0, name: `Member #${c.winner_member_id}` };
        stats[c.winner_member_id].wins += 0; // wins already counted at verification step, keep stable
        const loserId = c.challenger_member_id === c.winner_member_id ? c.opponent_member_id : c.challenger_member_id;
        if (!stats[loserId]) stats[loserId] = { wins: 0, losses: 0, name: `Member #${loserId}` };
        stats[loserId].losses += 0;
      });
    const rows = Object.entries(stats).map(([id, s]) => ({ id: parseInt(id), ...s, pct: s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) : 0 }));
    rows.sort((a, b) => (b.wins - a.wins) || (a.losses - b.losses) || (b.pct - a.pct));
    return rows;
  }, [members, challenges, season]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{season ? `${season.name} Standings` : 'Standings'}</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Player</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win%</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{r.name}</td>
                    <td>{r.wins}</td>
                    <td>{r.losses}</td>
                    <td>{(r.pct * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

