import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import backend from '@/lib/backend';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [form, setForm] = useState<{ name: string; area: string; tennis_rating: string; avatar_url?: string; availability: Array<{ day: number; enabled: boolean; start: string; end: string }> }>({ name: '', area: '', tennis_rating: '', avatar_url: '', availability: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await backend.auth.getUserInfo();
      setUser(u);
      if (u) {
        const { data: m } = await backend.members.getByUserId(u.ID);
        setMember(m);
        if (m) setForm({ name: m.name || '', area: m.area || '', tennis_rating: m.tennis_rating?.toString() || '', avatar_url: m.avatar_url || '', availability: m.availability || [] });
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    if (!user) { toast.error('Login required'); return; }
    try {
      if (member) {
        const { error } = await backend.members.update(member.id, {
          name: form.name,
          area: form.area,
          tennis_rating: form.tennis_rating ? parseFloat(form.tennis_rating) : null,
          availability: form.availability,
          avatar_url: form.avatar_url
        });
        if (error) throw new Error(error);
        toast.success('Profile updated');
      } else {
        const { data, error } = await backend.members.create({
          user_id: user.ID,
          name: form.name,
          area: form.area,
          tennis_rating: form.tennis_rating ? parseFloat(form.tennis_rating) : null,
          is_active: true,
          joined_at: new Date().toISOString(),
          availability: form.availability,
          avatar_url: form.avatar_url
        });
        if (error) throw new Error(error);
        setMember(data);
        toast.success('Profile created');
      }
    } catch (e) {
      toast.error('Failed to save');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Header /><main className="container mx-auto px-4 py-8">Loading...</main><Footer /></div>;

  if (!user) return <div className="min-h-screen bg-gray-50"><Header /><main className="container mx-auto px-4 py-12"><Card><CardContent className="p-8 text-center">Login required</CardContent></Card></main><Footer /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <Input value={form.area} onChange={e=>setForm({ ...form, area: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tennis Rating</label>
              <Input inputMode="decimal" value={form.tennis_rating} onChange={e=>setForm({ ...form, tennis_rating: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Avatar Image URL</label>
              <Input value={form.avatar_url || ''} onChange={e=>setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." />
            </div>
            {member && (
              <div className="text-sm text-gray-600">Wins: {member.wins || 0} • Losses: {member.losses || 0}</div>
            )}

            <div className="pt-4">
              <div className="font-semibold mb-2">Weekly Availability</div>
              <div className="text-xs text-gray-600 mb-2">Set your recurring availability (local time). Challenges can suggest overlapping times.</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-1">Day</th>
                    <th>Available</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    const row = form.availability[idx] || { day: idx, enabled: false, start: '17:00', end: '20:00' };
                    return (
                      <tr key={idx} className="border-b">
                        <td className="py-1">{days[idx]}</td>
                        <td>
                          <input type="checkbox" checked={row.enabled} onChange={e=>{
                            const next = [...form.availability];
                            next[idx] = { ...row, enabled: e.target.checked };
                            setForm({ ...form, availability: next });
                          }} />
                        </td>
                        <td>
                          <input type="time" value={row.start} onChange={e=>{
                            const next = [...form.availability];
                            next[idx] = { ...row, start: e.target.value };
                            setForm({ ...form, availability: next });
                          }} className="border rounded px-2 py-1" />
                        </td>
                        <td>
                          <input type="time" value={row.end} onChange={e=>{
                            const next = [...form.availability];
                            next[idx] = { ...row, end: e.target.value };
                            setForm({ ...form, availability: next });
                          }} className="border rounded px-2 py-1" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-right">
              <Button onClick={save}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
