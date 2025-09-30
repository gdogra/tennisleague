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

  const others = useMemo(() => (members || []).filter(x => member ? x.id !== member.id : true), [members, member]);

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
              {loading ? <div>Loading...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {others.map(p => (
                    <div key={p.id} className="border rounded p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name || `Member #${p.id}`}</div>
                        {p.tennis_rating && <div className="text-sm text-gray-600">Rating: {p.tennis_rating}</div>}
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

