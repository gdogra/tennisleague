import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import backend from '@/lib/backendClient';

export default function CourtsMapPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [q, setQ] = useState('San Diego Tennis Courts');

  useEffect(() => { (async () => { const { data } = await backend.courts.list(); setCourts(data || []); })(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <Card>
            <CardHeader><CardTitle>Courts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courts.map(c => (
                  <button key={c.id} className="block text-left w-full border rounded p-2 hover:bg-gray-50" onClick={()=>setQ(`${c.name} ${c.area}`)}>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-600">{c.area} • {c.surface} • {c.lights? 'Lights':''}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <div className="aspect-video w-full bg-white border">
            <iframe title="map" className="w-full h-full" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

