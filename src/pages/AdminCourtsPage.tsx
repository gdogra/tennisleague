import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', area: '', surface: 'Hard', lights: true });

  const API = (import.meta as any).env?.VITE_API_BASE;

  const load = async () => { const res = await fetch(`${API}/courts`); setCourts(res.ok ? await res.json() : []); };
  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch(`${API}/courts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', area: '', surface: 'Hard', lights: true });
    load();
  };
  const save = async (c: any) => {
    await fetch(`${API}/courts/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
    load();
  };
  const del = async (id: number) => { await fetch(`${API}/courts/${id}`, { method: 'DELETE' }); load(); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader><CardTitle>Admin • Courts</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
              <input className="border rounded px-2 py-1" placeholder="Name" value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
              <input className="border rounded px-2 py-1" placeholder="Area" value={form.area} onChange={e=>setForm({ ...form, area: e.target.value })} />
              <select className="border rounded px-2 py-1" value={form.surface} onChange={e=>setForm({ ...form, surface: e.target.value })}>
                <option>Hard</option><option>Clay</option><option>Grass</option>
              </select>
              <label className="text-sm"><input type="checkbox" className="mr-2" checked={form.lights} onChange={e=>setForm({ ...form, lights: e.target.checked })} />Lights</label>
              <Button onClick={create}>Add</Button>
            </div>

            <div className="space-y-3">
              {courts.map((c:any, i:number) => (
                <div key={c.id} className="border rounded p-3 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                  <input className="border rounded px-2 py-1" value={c.name} onChange={e=>{ const next=[...courts]; next[i]={...c,name:e.target.value}; setCourts(next); }} />
                  <input className="border rounded px-2 py-1" value={c.area} onChange={e=>{ const next=[...courts]; next[i]={...c,area:e.target.value}; setCourts(next); }} />
                  <select className="border rounded px-2 py-1" value={c.surface} onChange={e=>{ const next=[...courts]; next[i]={...c,surface:e.target.value}; setCourts(next); }}>
                    <option>Hard</option><option>Clay</option><option>Grass</option>
                  </select>
                  <label className="text-sm"><input type="checkbox" className="mr-2" checked={!!c.lights} onChange={e=>{ const next=[...courts]; next[i]={...c,lights:e.target.checked}; setCourts(next); }} />Lights</label>
                  <Button variant="outline" onClick={()=>save(c)}>Save</Button>
                  <Button variant="outline" onClick={()=>del(c.id)}>Delete</Button>
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

