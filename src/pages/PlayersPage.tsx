import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSidebar from '@/components/ContactSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import backend from '@/lib/backend';

export default function PlayersPage() {
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState<string>('');
  const [maxRating, setMaxRating] = useState<string>('');
  const [area, setArea] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const { data: u } = await backend.auth.getUserInfo();
        setUser(u);
        if (u) {
          const { data: m } = await backend.members.getByUserId(u.ID);
          setMember(m);
        }
        const { data: list } = await backend.members.list();
        setMembers(list || []);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const areas = useMemo(() => {
    const set = new Set<string>();
    (members || []).forEach((m: any) => { if (m.area) set.add(m.area); });
    return Array.from(set).sort();
  }, [members]);

  const others = useMemo(() => {
    let list = (members || []).filter(x => (member ? x.id !== member.id : true));
    if (search) list = list.filter(x => (x.name || '').toLowerCase().includes(search.toLowerCase()));
    const min = minRating ? parseFloat(minRating) : undefined;
    const max = maxRating ? parseFloat(maxRating) : undefined;
    if (min !== undefined) list = list.filter(x => (x.tennis_rating ?? 0) >= min);
    if (max !== undefined) list = list.filter(x => (x.tennis_rating ?? 0) <= max);
    if (area) list = list.filter(x => (x.area || '') === area);
    return list;
  }, [members, member, search, minRating, maxRating, area]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  placeholder="Search by name"
                  className="border rounded px-3 py-2" />
                <input
                  value={minRating}
                  onChange={(e)=>setMinRating(e.target.value)}
                  placeholder="Min rating"
                  className="border rounded px-3 py-2"
                  inputMode="decimal" />
                <input
                  value={maxRating}
                  onChange={(e)=>setMaxRating(e.target.value)}
                  placeholder="Max rating"
                  className="border rounded px-3 py-2"
                  inputMode="decimal" />
                <select className="border rounded px-3 py-2" value={area} onChange={(e)=>setArea(e.target.value)}>
                  <option value="">All areas</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {loading ? <div>Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {others.map(p => (
                    <div key={p.id} className="border rounded p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name || `Member #${p.id}`}</div>
                        <div className="text-sm text-gray-600">
                          {p.tennis_rating ? `Rating: ${p.tennis_rating}` : 'Rating: N/A'}
                          {p.area ? ` • Area: ${p.area}` : ''}
                        </div>
                      </div>
                      <Button onClick={() => navigate(`/challenges?opponentId=${p.id}`)} disabled={!user}>Challenge</Button>
                    </div>
                  ))}
                </div>
              )}
              {!user && !loading && <div className="mt-4 text-sm text-gray-600">Login to challenge players.</div>}
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
