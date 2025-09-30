import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import backend from '@/lib/backend';

export default function PlayerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [me, setMe] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await backend.auth.getUserInfo();
      if (u) {
        const { data: m } = await backend.members.getByUserId(u.ID);
        setMe(m);
      }
      const all = (await backend.members.list()).data || [];
      const p = all.find((m:any) => m.id === Number(id));
      setPlayer(p || null);
    };
    load();
  }, [id]);

  if (!player) {
    return <div className="min-h-screen bg-gray-50"><Header /><main className="container mx-auto px-4 py-8">Player not found</main><Footer /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>{player.name || `Member #${player.id}`}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>Rating: {player.tennis_rating ?? 'N/A'} {player.rating_elo ? `(ELO ${player.rating_elo})` : ''}</div>
            <div>Area: {player.area || 'N/A'}</div>
            <div>Record: {player.wins || 0} - {player.losses || 0}</div>
            <div className="pt-2">
              <div className="font-medium mb-1">Availability</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b"><th className="py-1">Day</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    const row = (player.availability || [])[idx];
                    return (
                      <tr key={idx} className="border-b">
                        <td className="py-1">{days[idx]}</td>
                        <td>{row?.enabled ? `${row.start} - ${row.end}` : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-right">
              <Button onClick={() => navigate(`/challenges?opponentId=${player.id}`)} disabled={!me}>Challenge</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

