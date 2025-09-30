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
  const [form, setForm] = useState({ name: '', area: '', tennis_rating: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await backend.auth.getUserInfo();
      setUser(u);
      if (u) {
        const { data: m } = await backend.members.getByUserId(u.ID);
        setMember(m);
        if (m) setForm({ name: m.name || '', area: m.area || '', tennis_rating: m.tennis_rating?.toString() || '' });
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
          tennis_rating: form.tennis_rating ? parseFloat(form.tennis_rating) : null
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
          joined_at: new Date().toISOString()
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
            {member && (
              <div className="text-sm text-gray-600">Wins: {member.wins || 0} • Losses: {member.losses || 0}</div>
            )}
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

