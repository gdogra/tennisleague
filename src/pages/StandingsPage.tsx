import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StandingsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [season, setSeason] = useState<any>(null);
  const [division, setDivision] = useState<string>('');
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
    const key = `app_season_${seasonId}_members`;
    const enrolled = seasonId ? (((localStorage.getItem(key) && JSON.parse(localStorage.getItem(key) as string)) || []).map((x:any)=>x.member_id)) : members.map(m=>m.id);
    const stats: Record<number, { wins: number; losses: number; name: string; elo?: number }> = {};
    members.forEach((m) => { if (enrolled.includes(m.id)) stats[m.id] = { wins: m.wins || 0, losses: m.losses || 0, name: m.name || `Member #${m.id}`, elo: m.rating_elo }; });
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
    let rows = Object.entries(stats).map(([id, s]) => ({ id: parseInt(id), ...s, pct: s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) : 0 }));
    if (division) {
      const key2 = `app_season_${seasonId}_members`;
      const enroll = ((localStorage.getItem(key2) && JSON.parse(localStorage.getItem(key2) as string)) || []).filter((x:any)=>x.division===division).map((x:any)=>x.member_id);
      rows = rows.filter(r => enroll.includes(r.id));
    }
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
            <div className="flex items-center justify-between mb-3">
              <div className="space-x-2 text-sm">
                <label>Division:</label>
                <select className="border rounded px-2 py-1" value={division} onChange={e=>setDivision(e.target.value)}>
                  <option value="">All</option>
                  {(season?.divisions || []).map((d:string)=> <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button className="text-sm underline" onClick={()=>{
                const csv = ['Player,ELO,Wins,Losses,Win%'].concat(table.map(r=>`${r.name},${r.elo||''},${r.wins},${r.losses},${(r.pct*100).toFixed(0)}%`)).join('\n');
                const url = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
                const a = document.createElement('a'); a.href=url; a.download='standings.csv'; a.click();
              }}>Export CSV</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Player</th>
                  <th>ELO</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win%</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{r.name}</td>
                    <td>{r.elo || ''}</td>
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
