import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import backend from '@/lib/backend';
import { toast } from 'sonner';

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await backend.auth.getUserInfo();
      setUser(u);
      if (u) {
        const { data: m } = await backend.members.getByUserId(u.ID);
        setMember(m);
      }
      const list = (localStorage.getItem('app_seasons') && JSON.parse(localStorage.getItem('app_seasons') as string)) || [];
      setSeasons(list);
    };
    load();
  }, []);

  const enroll = async (s: any) => {
    if (!member) { toast.error('Login required'); return; }
    const key = `app_season_${s.id}_members`;
    const arr = (localStorage.getItem(key) && JSON.parse(localStorage.getItem(key) as string)) || [];
    if (arr.find((x: any) => x.member_id === member.id)) { toast.success('Already enrolled'); return; }
    arr.push({ member_id: member.id, division: s.divisions?.[0] || 'Open', joined_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr));
    toast.success('Enrolled');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Seasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seasons.map((s) => (
                <div key={s.id} className="border rounded p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-600">{new Date(s.start).toLocaleDateString()} - {new Date(s.end).toLocaleDateString()} • Divisions: {s.divisions?.join(', ')}</div>
                  </div>
                  <div className="space-x-2">
                    <Button onClick={() => enroll(s)} disabled={!user}>Enroll</Button>
                    <a className="text-blue-600" href={`/standings?seasonId=${s.id}`}>View Standings</a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

