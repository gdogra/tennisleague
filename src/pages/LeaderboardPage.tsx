import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import backend from '@/lib/backendClient';

export default function LeaderboardPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [sort, setSort] = useState<'elo'|'wins'>('elo');

  useEffect(() => {
    const load = async () => {
      const { data } = await backend.members.list();
      setMembers(data || []);
    };
    load();
  }, []);

  const rows = useMemo(() => {
    const r = [...(members||[])];
    r.sort((a,b) => sort==='elo' ? ((b.rating_elo||0)-(a.rating_elo||0)) : ((b.wins||0)-(a.wins||0)) || ((a.losses||0)-(b.losses||0)) );
    return r.slice(0, 100);
  }, [members, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <label className="mr-2 text-sm">Sort by:</label>
              <select className="border rounded px-2 py-1" value={sort} onChange={e=>setSort(e.target.value as any)}>
                <option value="elo">ELO</option>
                <option value="wins">Wins</option>
              </select>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b"><th className="py-2">Player</th><th>ELO</th><th>Wins</th><th>Losses</th></tr>
              </thead>
              <tbody>
                {rows.map(m => (
                  <tr key={m.id} className="border-b">
                    <td className="py-2">{m.name || `Member #${m.id}`}</td>
                    <td>{m.rating_elo || 1500}</td>
                    <td>{m.wins || 0}</td>
                    <td>{m.losses || 0}</td>
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
