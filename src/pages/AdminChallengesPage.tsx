import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import backend from '@/lib/backend';

export default function AdminChallengesPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [contested, setContested] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const load = async () => {
    const { data: adminList } = await backend.challenges.listAdmin();
    setPending(adminList?.pending || []);
    setContested(adminList?.contested || []);
    const { data: m } = await backend.members.list();
    setMembers(m || []);
  };

  useEffect(() => { load(); }, []);

  const name = (id: number) => members.find(m => m.id === id)?.name || `Member #${id}`;

  const approve = async (c: any) => {
    await backend.challenges.verifyResult(c.id, true);
    await load();
  };
  const contest = async (c: any) => {
    await backend.challenges.verifyResult(c.id, false, 'Admin contested');
    await load();
  };
  const overrideWinner = async (c: any, winnerId: number) => {
    await backend.challenges.adminOverride(c.id, winnerId);
    await load();
  };

  const ChallengeRow = ({ c }: { c: any }) => (
    <div className="border rounded p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{name(c.challenger_member_id)} vs {name(c.opponent_member_id)}</div>
          <div className="text-xs text-gray-600">{c.proposed_date ? new Date(c.proposed_date).toLocaleString() : 'No date'} • {c.location || 'TBD'}</div>
          {c.sets && <div className="text-sm">Sets: {c.sets.map((s: any) => `${s.a}-${s.b}`).join(', ')}</div>}
          {c.verification_status && <div className="text-xs">Verification: {c.verification_status}{c.contest_note ? ` • Note: ${c.contest_note}` : ''}</div>}
        </div>
        <div className="space-x-2">
          <Button size="sm" onClick={() => approve(c)}>Approve</Button>
          <Button size="sm" variant="outline" onClick={() => contest(c)}>Contest</Button>
          <Button size="sm" variant="outline" onClick={() => overrideWinner(c, c.challenger_member_id)}>Set {name(c.challenger_member_id)} Wins</Button>
          <Button size="sm" variant="outline" onClick={() => overrideWinner(c, c.opponent_member_id)}>Set {name(c.opponent_member_id)} Wins</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader><CardTitle>Result Pending</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pending.length === 0 && <div className="text-sm text-gray-600">None</div>}
              {pending.map(c => <ChallengeRow key={c.id} c={c} />)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contested</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contested.length === 0 && <div className="text-sm text-gray-600">None</div>}
              {contested.map(c => <ChallengeRow key={c.id} c={c} />)}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

