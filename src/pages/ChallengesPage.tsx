import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSidebar from '@/components/ContactSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import backend from '@/lib/backend';
import { toast } from 'sonner';

export default function ChallengesPage() {
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Form state
  const [opponentId, setOpponentId] = useState<number | ''>('' as any);
  const [proposedDate, setProposedDate] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const { data: u } = await backend.auth.getUserInfo();
        if (!u) { setLoading(false); return; }
        setUser(u);
        const { data: m } = await backend.members.getByUserId(u.ID);
        if (!m) { setLoading(false); return; }
        setMember(m);

        const { data: list } = await backend.members.list();
        setMembers(list || []);

        const { data: ch } = await backend.challenges.listForMember(m.id);
        setIncoming(ch?.incoming || []);
        setOutgoing(ch?.outgoing || []);

        const preselect = searchParams.get('opponentId');
        if (preselect) setOpponentId(parseInt(preselect));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  const opponents = useMemo(() => (members || []).filter(x => member ? x.id !== member.id : true), [members, member]);

  const submitChallenge = async () => {
    if (!member) { toast.error('Please login'); return; }
    if (!opponentId) { toast.error('Select an opponent'); return; }
    const { error } = await backend.challenges.create({
      challenger_member_id: member.id,
      opponent_member_id: Number(opponentId),
      proposed_date: proposedDate,
      location,
      message
    });
    if (error) { toast.error('Failed to create challenge'); return; }
    toast.success('Challenge sent');
    setProposedDate(''); setLocation(''); setMessage('');
    const { data: ch } = await backend.challenges.listForMember(member.id);
    setIncoming(ch?.incoming || []);
    setOutgoing(ch?.outgoing || []);
  };

  const act = async (id: number, status: 'Accepted'|'Declined'|'Cancelled'|'Completed') => {
    const { error } = await backend.challenges.updateStatus(id, status);
    if (error) { toast.error('Update failed'); return; }
    const { data: ch } = await backend.challenges.listForMember(member!.id);
    setIncoming(ch?.incoming || []);
    setOutgoing(ch?.outgoing || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50"><Header /><main className="container mx-auto px-4 py-8">Loading...</main><Footer /></div>
    );
  }

  if (!user || !member) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">Please log in to challenge players.</p>
              <Button onClick={() => window.location.href = '/members/memberlogin'}>Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>New Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Opponent</label>
                <select className="w-full border rounded px-3 py-2" value={opponentId} onChange={e => setOpponentId(e.target.value ? Number(e.target.value) : '' as any)}>
                  <option value="">Select a player</option>
                  {opponents.map(o => <option key={o.id} value={o.id}>{o.name || `Member #${o.id}`} {o.tennis_rating ? `( ${o.tennis_rating} )` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Proposed Date & Time</label>
                  <Input type="datetime-local" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input placeholder="e.g., Balboa Tennis Club" value={location} onChange={(e)=>setLocation(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea placeholder="Add an optional note" value={message} onChange={(e)=>setMessage(e.target.value)} />
              </div>
              <div className="text-right">
                <Button onClick={submitChallenge}>Send Challenge</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Outgoing */}
                <div>
                  <h3 className="font-semibold mb-3">Outgoing</h3>
                  <div className="space-y-3">
                    {outgoing.length === 0 && <p className="text-sm text-gray-600">No outgoing challenges</p>}
                    {outgoing.map(c => (
                      <div key={c.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">To: {(members.find(m=>m.id===c.opponent_member_id)?.name) || `Member #${c.opponent_member_id}`}</div>
                            <div className="text-xs text-gray-600">{c.proposed_date ? new Date(c.proposed_date).toLocaleString() : 'No date specified'} • {c.location || 'TBD'}</div>
                          </div>
                          <Badge>{c.status}</Badge>
                        </div>
                        {c.message && <div className="text-sm text-gray-700 mt-2">{c.message}</div>}
                        {c.status === 'Pending' && <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={() => act(c.id, 'Cancelled')}>Cancel</Button>
                        </div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incoming */}
                <div>
                  <h3 className="font-semibold mb-3">Incoming</h3>
                  <div className="space-y-3">
                    {incoming.length === 0 && <p className="text-sm text-gray-600">No incoming challenges</p>}
                    {incoming.map(c => (
                      <div key={c.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">From: {(members.find(m=>m.id===c.challenger_member_id)?.name) || `Member #${c.challenger_member_id}`}</div>
                            <div className="text-xs text-gray-600">{c.proposed_date ? new Date(c.proposed_date).toLocaleString() : 'No date specified'} • {c.location || 'TBD'}</div>
                          </div>
                          <Badge>{c.status}</Badge>
                        </div>
                        {c.message && <div className="text-sm text-gray-700 mt-2">{c.message}</div>}
                        <div className="mt-2 space-x-2">
                          {c.status === 'Pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => act(c.id, 'Accepted')}>Accept</Button>
                              <Button size="sm" variant="outline" onClick={() => act(c.id, 'Declined')}>Decline</Button>
                            </>
                          )}
                          {c.status === 'Accepted' && (
                            <Button size="sm" variant="outline" onClick={() => act(c.id, 'Completed')}>Mark Completed</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ContactSidebar />
        </div>
      </div>
      <Footer />
    </div>
  );
}

