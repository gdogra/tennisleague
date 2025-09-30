import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import backend from '@/lib/backend';

export default function SchedulePage() {
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: u } = await backend.auth.getUserInfo();
      setUser(u);
      if (!u) return;
      const { data: m } = await backend.members.getByUserId(u.ID);
      setMember(m);
      if (!m) return;
      const { data: ch } = await backend.challenges.listForMember(m.id);
      setIncoming(ch?.incoming || []);
      setOutgoing(ch?.outgoing || []);
    };
    load();
  }, []);

  const all = useMemo(() => [...incoming, ...outgoing], [incoming, outgoing]);
  const upcoming = all.filter(c => c.status === 'Accepted' && c.proposed_date).sort((a,b)=>a.proposed_date.localeCompare(b.proposed_date));
  const pending = all.filter(c => c.status === 'Pending');
  const resultPending = all.filter(c => c.status === 'ResultPending');
  const past = all.filter(c => c.status === 'Completed').sort((a,b)=> (b.updated_at||'').localeCompare(a.updated_at||''));

  const Section = ({ title, rows }: { title: string; rows: any[] }) => (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.length === 0 && <div className="text-sm text-gray-600">None</div>}
          {rows.map(c => (
            <div key={c.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Match #{c.id}</div>
                  <div className="text-xs text-gray-600">{c.proposed_date ? new Date(c.proposed_date).toLocaleString() : 'No date'} • {c.location || 'TBD'}</div>
                </div>
                <div className="text-xs">{c.status}{c.verification_status ? ` • ${c.verification_status}` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Section title="Upcoming" rows={upcoming} />
        <Section title="Pending" rows={pending} />
        <Section title="Awaiting Verification" rows={resultPending} />
        <Section title="Completed" rows={past} />
      </main>
      <Footer />
    </div>
  );
}

