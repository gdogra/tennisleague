import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import backend from '@/lib/backendClient';

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [division, setDivision] = useState('');
  const [memberId, setMemberId] = useState('');
  const [bulk, setBulk] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('Division Update');

  useEffect(() => {
    const load = async () => {
      const ss = (await (await fetch((import.meta as any).env?.VITE_API_BASE + '/seasons')).json()) || [];
      setSeasons(ss);
      const { data: m } = await backend.members.list();
      setMembers(m || []);
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!selected) { setEnrollments([]); return; }
      const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/enrollments`);
      const data = res.ok ? await res.json() : [];
      setEnrollments(data || []);
    };
    load();
  }, [selected]);

  const enroll = async () => {
    if (!selected || !memberId) return;
    await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_id: Number(memberId), division: division || 'Open' }) });
    setMemberId('');
    const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/enrollments`);
    setEnrollments(res.ok ? await res.json() : []);
  };
  const remove = async (mid: number) => {
    if (!selected) return;
    await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/enroll/${mid}`, { method: 'DELETE' });
    const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/enrollments`);
    setEnrollments(res.ok ? await res.json() : []);
  };
  const lock = async (locked: boolean) => {
    if (!selected) return;
    await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/lock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locked }) });
    const ss = await (await fetch((import.meta as any).env?.VITE_API_BASE + '/seasons')).json(); setSeasons(ss || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader><CardTitle>Admin • Seasons</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="border rounded px-3 py-2" value={selected || ''} onChange={e=>setSelected(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Select Season</option>
                {seasons.map(s => <option key={s.id} value={s.id}>{s.name}{s.locked ? ' (Locked)' : ''}</option>)}
              </select>
              <div className="space-x-2">
                <Button onClick={()=>lock(true)} disabled={!selected}>Lock Roster</Button>
                <Button variant="outline" onClick={()=>lock(false)} disabled={!selected}>Unlock</Button>
              </div>
            </div>
            {selected && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <select className="border rounded px-3 py-2" value={memberId} onChange={e=>setMemberId(e.target.value)}>
                    <option value="">Select Member</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name || `Member #${m.id}`}</option>)}
                  </select>
                  <select className="border rounded px-3 py-2" value={division} onChange={e=>setDivision(e.target.value)}>
                    <option value="">Open</option>
                    {(seasons.find(s=>s.id===selected)?.divisions || []).map((d:string)=> <option key={d} value={d}>{d}</option>)}
                  </select>
                  <Button onClick={enroll}>Enroll</Button>
                </div>
              <div className="mt-4">
                <div className="font-medium mb-2">Enrolled Members</div>
                <div className="space-y-2">
                    {enrollments.map((e:any) => (
                      <div key={e.member_id} className="border rounded p-2 flex items-center justify-between">
                        <div>{members.find(m=>m.id===e.member_id)?.name || `Member #${e.member_id}`} • Division: {e.division}</div>
                        <Button variant="outline" size="sm" onClick={()=>remove(e.member_id)}>Remove</Button>
                      </div>
                    ))}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium mb-2">Bulk Enroll (CSV: member_id,division)</div>
                  <textarea className="w-full border rounded p-2 h-32" value={bulk} onChange={e=>setBulk(e.target.value)} placeholder="201,4.0\n202,3.5" />
                  <Button className="mt-2" variant="outline" onClick={async ()=>{
                    if (!selected) return;
                    const lines = bulk.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
                    for (const line of lines) {
                      const [mid, div] = line.split(',').map(s=>s.trim());
                      await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_id: Number(mid), division: div || 'Open' }) });
                    }
                    setBulk('');
                    const res = await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/enrollments`);
                    setEnrollments(res.ok ? await res.json() : []);
                  }}>Import</Button>
                </div>
                <div>
                  <div className="font-medium mb-2">Email Division</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <select className="border rounded px-2 py-1" value={division} onChange={e=>setDivision(e.target.value)}>
                      <option value="">All</option>
                      {(seasons.find(s=>s.id===selected)?.divisions || []).map((d:string)=> <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input className="border rounded px-2 py-1 md:col-span-2" placeholder="Subject" value={emailSubject} onChange={e=>setEmailSubject(e.target.value)} />
                  </div>
                  <textarea className="w-full border rounded p-2 h-32" value={emailBody} onChange={e=>setEmailBody(e.target.value)} placeholder="<p>Hello division players, ...</p>" />
                  <Button className="mt-2" onClick={async ()=>{
                    if (!selected) return;
                    await fetch(`${(import.meta as any).env?.VITE_API_BASE}/seasons/${selected}/email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ division, subject: emailSubject, html: emailBody }) });
                    alert('Emails sent (if configured).');
                  }}>Send Email</Button>
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
