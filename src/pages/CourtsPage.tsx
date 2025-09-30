import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSidebar from '@/components/ContactSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import backend from '@/lib/backend';

export default function CourtsPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [area, setArea] = useState('');
  const [surface, setSurface] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await backend.courts.list();
      setCourts(data || []);
    };
    load();
  }, []);

  const areas = useMemo(() => Array.from(new Set((courts||[]).map((c:any)=>c.area))).sort(), [courts]);
  const surfaces = useMemo(() => Array.from(new Set((courts||[]).map((c:any)=>c.surface))).sort(), [courts]);
  const filtered = useMemo(() => (courts||[]).filter(c => (!area || c.area===area) && (!surface || c.surface===surface)), [courts, area, surface]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader><CardTitle>Tennis Courts</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <select className="border rounded px-3 py-2" value={area} onChange={e=>setArea(e.target.value)}>
                  <option value="">All Areas</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select className="border rounded px-3 py-2" value={surface} onChange={e=>setSurface(e.target.value)}>
                  <option value="">All Surfaces</option>
                  {surfaces.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="border rounded px-3 py-2" onClick={()=>{setArea('');setSurface('');}}>Reset</button>
              </div>
              <div className="space-y-3">
                {filtered.map(c => (
                  <div key={c.id} className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-gray-600">{c.area} • {c.surface} • {c.lights? 'Lights' : 'No lights'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1"><ContactSidebar /></div>
      </div>
      <Footer />
    </div>
  );
}

