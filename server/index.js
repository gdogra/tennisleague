import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db, nextId } from './storage.js';
import { sseHandler, broadcast, broadcastSelective } from './events.js';
import { buildIcs } from './ics.js';
import { sendEmail } from './mailer.js';
import { SlotsSchema, ResultReportSchema, MemberPatchSchema } from './schemas.js';
import { sseHandler, broadcast } from './events.js';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// SSE events
app.get('/events', sseHandler);

// SSE events
app.get('/events', sseHandler);

// Auth (demo)
app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const store = db();
  const token = Math.random().toString(36).slice(2) + Date.now();
  const user = { id: 100, email, name: email.split('@')[0], roles: email.endsWith('@tennisleague.com') ? 'Admin' : 'Member' };
  store.data.sessions[token] = user;
  store.save();
  res.setHeader('Set-Cookie', `sid=${token}; Path=/; HttpOnly; SameSite=Lax`);
  res.json({ token, user });
});
app.post('/auth/logout', (req, res) => {
  const store = db();
  const token = (req.headers.cookie || '').split('; ').find(s=>s.startsWith('sid='))?.split('=')[1];
  if (token) delete store.data.sessions[token];
  store.save();
  res.json({ ok: true });
});
app.get('/auth/user', (req, res) => {
  const store = db();
  const token = (req.headers.cookie || '').split('; ').find(s=>s.startsWith('sid='))?.split('=')[1];
  res.json({ user: (token && store.data.sessions[token]) || null });
});

// Members
app.get('/members', (req, res) => {
  const store = db();
  res.json(store.data.members);
});
app.get('/members/by-user/:userId', (req, res) => {
  const store = db();
  const m = store.data.members.find(m => m.user_id === Number(req.params.userId));
  res.json(m || null);
});
app.post('/members', (req, res) => {
  const store = db();
  const created = { id: nextId(store.data.members), wins: 0, losses: 0, rating_elo: 1500, ...req.body };
  store.data.members.push(created);
  store.save();
  res.json(created);
});
app.patch('/members/:id', (req, res) => {
  const store = db();
  const idx = store.data.members.findIndex(m => m.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const parsed = MemberPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_member' });
  store.data.members[idx] = { ...store.data.members[idx], ...parsed.data };
  store.save();
  res.json(store.data.members[idx]);
});

// Challenges
app.get('/challenges/member/:memberId', (req, res) => {
  const store = db();
  const memberId = Number(req.params.memberId);
  const all = store.data.challenges;
  res.json({
    incoming: all.filter(c => c.opponent_member_id === memberId),
    outgoing: all.filter(c => c.challenger_member_id === memberId)
  });
});
app.post('/challenges', (req, res) => {
  const store = db();
  const now = new Date().toISOString();
  const created = { id: nextId(store.data.challenges), status: 'Pending', verification_status: 'None', created_at: now, updated_at: now, ...req.body };
  store.data.challenges.push(created);
  store.save();
  try {
    const participants = [created.challenger_member_id, created.opponent_member_id];
    broadcastSelective((client) => {
      const token = client.token; if (!token) return false; const store2 = db(); const user = store2.data.sessions[token];
      if (!user) return false; const m = store2.data.members.find(mm => mm.user_id === (user.id || 100));
      return m && participants.includes(m.id);
    }, { type: 'challenge_update', challenge: created });
  } catch {}
  res.json(created);
});
app.patch('/challenges/:id/status', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  store.data.challenges[idx] = { ...store.data.challenges[idx], status: req.body.status, updated_at: new Date().toISOString() };
  store.save();
  try {
    const cc = store.data.challenges[idx]; const participants = [cc.challenger_member_id, cc.opponent_member_id];
    broadcastSelective((client) => { const t=client.token; if(!t) return false; const s=db(); const u=s.data.sessions[t]; if(!u) return false; const m=s.data.members.find(mm=>mm.user_id===(u.id||100)); return m && participants.includes(m.id); }, { type: 'challenge_update', challenge: cc });
  } catch {}
  // Send acceptance emails with ICS
  try {
    const match = store.data.challenges[idx];
    const start = new Date(match.proposed_date);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const ics = buildIcs({ uid: `match-${match.id}@tlnet`, startISO: start.toISOString(), endISO: end.toISOString(), title: 'Tennis Match', location: match.location });
    const members = store.data.members;
    const a = members.find(m => m.id === match.challenger_member_id);
    const b = members.find(m => m.id === match.opponent_member_id);
    const html = `<p>Your match is scheduled for ${start.toLocaleString()} at ${match.location || 'TBD'}.</p>`;
    if (a?.email) await sendEmail({ to: a.email, subject: 'Match Accepted', html, ics });
    if (b?.email) await sendEmail({ to: b.email, subject: 'Match Accepted', html, ics });
  } catch {}
  res.json(store.data.challenges[idx]);
});
app.patch('/challenges/:id/schedule', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  store.data.challenges[idx] = { ...store.data.challenges[idx], proposed_date: req.body.proposed_date, location: req.body.location, updated_at: new Date().toISOString() };
  store.save();
  try { const cc=store.data.challenges[idx]; const participants=[cc.challenger_member_id,cc.opponent_member_id]; broadcastSelective((client)=>{ const t=client.token; if(!t) return false; const s=db(); const u=s.data.sessions[t]; if(!u) return false; const m=s.data.members.find(mm=>mm.user_id===(u.id||100)); return m && participants.includes(m.id); }, { type: 'challenge_update', challenge: cc }); } catch {}
  res.json(store.data.challenges[idx]);
});
app.post('/challenges/:id/slots', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const parsed = SlotsSchema.safeParse(req.body.slots || []);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_slots' });
  const slots = parsed.data.map((s) => ({ id: nextId(store.data.chats), start: s.start, end: s.end }));
  store.data.challenges[idx] = { ...store.data.challenges[idx], proposed_slots: slots, updated_at: new Date().toISOString() };
  store.save();
  try { const cc=store.data.challenges[idx]; const participants=[cc.challenger_member_id,cc.opponent_member_id]; broadcastSelective((client)=>{ const t=client.token; if(!t) return false; const s=db(); const u=s.data.sessions[t]; if(!u) return false; const m=s.data.members.find(mm=>mm.user_id===(u.id||100)); return m && participants.includes(m.id); }, { type: 'challenge_update', challenge: cc }); } catch {}
  res.json(store.data.challenges[idx]);
});
app.post('/challenges/:id/accept-slot', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const c = store.data.challenges[idx];
  const chosen = (c.proposed_slots || []).find(s => s.id === Number(req.body.slotId));
  if (!chosen) return res.status(400).json({ error: 'slot_not_found' });
  store.data.challenges[idx] = { ...c, status: 'Accepted', proposed_date: chosen.start, location: req.body.location || c.location, updated_at: new Date().toISOString() };
  store.save();
  try { const cc=store.data.challenges[idx]; const participants=[cc.challenger_member_id,cc.opponent_member_id]; broadcastSelective((client)=>{ const t=client.token; if(!t) return false; const s=db(); const u=s.data.sessions[t]; if(!u) return false; const m=s.data.members.find(mm=>mm.user_id===(u.id||100)); return m && participants.includes(m.id); }, { type: 'challenge_update', challenge: cc }); } catch {}
  res.json(store.data.challenges[idx]);
});
app.post('/challenges/:id/report', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const parsed = ResultReportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_report' });
  const c = store.data.challenges[idx];
  store.data.challenges[idx] = { ...c, status: 'ResultPending', verification_status: 'Pending', result_reported_by: parsed.data.winner_member_id, winner_member_id: parsed.data.winner_member_id, sets: parsed.data.sets, updated_at: new Date().toISOString() };
  store.save();
  try { broadcast({ type: 'challenge_update', challenge: store.data.challenges[idx] }); } catch {}
  res.json(store.data.challenges[idx]);
});
app.post('/challenges/:id/verify', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const approve = !!req.body.approve;
  let c = store.data.challenges[idx];
  if (approve) {
    c = { ...c, status: 'Completed', verification_status: 'Verified', updated_at: new Date().toISOString() };
    // update stats
    const winIdx = store.data.members.findIndex(m => m.id === c.winner_member_id);
    const loserId = c.challenger_member_id === c.winner_member_id ? c.opponent_member_id : c.challenger_member_id;
    const loseIdx = store.data.members.findIndex(m => m.id === loserId);
    if (winIdx !== -1) store.data.members[winIdx].wins = (store.data.members[winIdx].wins || 0) + 1;
    if (loseIdx !== -1) store.data.members[loseIdx].losses = (store.data.members[loseIdx].losses || 0) + 1;
  } else {
    c = { ...c, verification_status: 'Contested', contest_note: req.body.note || '', updated_at: new Date().toISOString() };
  }
  store.data.challenges[idx] = c;
  store.save();
  try { const participants=[c.challenger_member_id,c.opponent_member_id]; broadcastSelective((client)=>{ const t=client.token; if(!t) return false; const s=db(); const u=s.data.sessions[t]; if(!u) return false; const m=s.data.members.find(mm=>mm.user_id===(u.id||100)); return m && participants.includes(m.id); }, { type: 'challenge_update', challenge: c }); } catch {}
  res.json(c);
});
app.get('/challenges/admin', (req, res) => {
  const store = db();
  const all = store.data.challenges;
  res.json({ pending: all.filter(c => c.status === 'ResultPending' || c.verification_status === 'Pending'), contested: all.filter(c => c.verification_status === 'Contested') });
});
app.post('/challenges/:id/override', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  let c = store.data.challenges[idx];
  c = { ...c, status: 'Completed', verification_status: 'Verified', winner_member_id: req.body.winner_member_id, updated_at: new Date().toISOString() };
  store.data.challenges[idx] = c;
  // stats
  const winIdx = store.data.members.findIndex(m => m.id === c.winner_member_id);
  const loserId = c.challenger_member_id === c.winner_member_id ? c.opponent_member_id : c.challenger_member_id;
  const loseIdx = store.data.members.findIndex(m => m.id === loserId);
  if (winIdx !== -1) store.data.members[winIdx].wins = (store.data.members[winIdx].wins || 0) + 1;
  if (loseIdx !== -1) store.data.members[loseIdx].losses = (store.data.members[loseIdx].losses || 0) + 1;
  store.save();
  res.json(c);
});

// Chats
app.get('/chats/:challengeId', (req, res) => {
  const store = db();
  const items = store.data.chats.filter(m => m.challenge_id === Number(req.params.challengeId));
  res.json(items.sort((a,b)=>a.created_at.localeCompare(b.created_at)));
});
app.post('/chats/:challengeId', (req, res) => {
  const store = db();
  const created = { id: nextId(store.data.chats), challenge_id: Number(req.params.challengeId), sender_member_id: req.body.sender_member_id, message: req.body.message, created_at: new Date().toISOString() };
  store.data.chats.push(created);
  store.save();
  try { const challenge = store.data.challenges.find(c=>c.id===created.challenge_id); const participants= challenge? [challenge.challenger_member_id, challenge.opponent_member_id]: []; broadcastSelective((client)=>{ const t=client.token; if(!t) return false; const s=db(); const u=s.data.sessions[t]; if(!u) return false; const m=s.data.members.find(mm=>mm.user_id===(u.id||100)); return m && participants.includes(m.id); }, { type: 'chat', challenge_id: created.challenge_id, message: created }); } catch {}
  res.json(created);
});

// Seasons/Courts
app.get('/seasons', (req, res) => { const store = db(); res.json(store.data.seasons); });
app.get('/courts', (req, res) => { const store = db(); res.json(store.data.courts); });
app.post('/seasons/:id/email', async (req, res) => {
  const store = db();
  const seasonId = String(req.params.id);
  const div = req.body.division || '';
  const subject = req.body.subject || 'League Notice';
  const html = req.body.html || '<p>Hello players,</p>';
  const enrol = (store.data.seasonMembers[seasonId] || []).filter(e => (div ? e.division === div : true));
  const targets = enrol.map(e => store.data.members.find(m => m.id === e.member_id)).filter(Boolean);
  for (const m of targets) {
    if (m.email) await sendEmail({ to: m.email, subject, html });
  }
  res.json({ sent: targets.length });
});

// Season enrollment and locking
app.get('/seasons/:id/enrollments', (req, res) => {
  const store = db();
  const key = String(req.params.id);
  res.json(store.data.seasonMembers[key] || []);
});
app.post('/seasons/:id/enroll', (req, res) => {
  const store = db();
  const key = String(req.params.id);
  store.data.seasonMembers[key] = store.data.seasonMembers[key] || [];
  const exists = store.data.seasonMembers[key].find(x => x.member_id === req.body.member_id);
  if (!exists) store.data.seasonMembers[key].push({ member_id: req.body.member_id, division: req.body.division || 'Open', joined_at: new Date().toISOString() });
  store.save();
  res.json(store.data.seasonMembers[key]);
});
app.delete('/seasons/:id/enroll/:memberId', (req, res) => {
  const store = db();
  const key = String(req.params.id);
  store.data.seasonMembers[key] = (store.data.seasonMembers[key] || []).filter(x => x.member_id !== Number(req.params.memberId));
  store.save();
  res.json(store.data.seasonMembers[key]);
});
app.post('/seasons/:id/lock', (req, res) => {
  const store = db();
  const season = store.data.seasons.find(s => s.id === Number(req.params.id));
  if (!season) return res.status(404).json({ error: 'not found' });
  season.locked = !!req.body.locked;
  store.save();
  res.json(season);
});

// Courts admin CRUD
app.post('/courts', (req, res) => {
  const store = db();
  const created = { id: nextId(store.data.courts), ...req.body };
  store.data.courts.push(created);
  store.save();
  res.json(created);
});
app.patch('/courts/:id', (req, res) => {
  const store = db();
  const idx = store.data.courts.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  store.data.courts[idx] = { ...store.data.courts[idx], ...req.body };
  store.save();
  res.json(store.data.courts[idx]);
});
app.delete('/courts/:id', (req, res) => {
  const store = db();
  store.data.courts = store.data.courts.filter(c => c.id !== Number(req.params.id));
  store.save();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  // Reminder scheduler: check every 5 minutes
  setInterval(async () => {
    try {
      const store = db();
      const now = Date.now();
      for (const c of store.data.challenges) {
        if (c.status !== 'Accepted' || !c.proposed_date) continue;
        const start = new Date(c.proposed_date).getTime();
        const in24h = Math.abs(start - (now + 24*60*60*1000)) < 5*60*1000;
        const in1h = Math.abs(start - (now + 60*60*1000)) < 5*60*1000;
        const members = store.data.members;
        const a = members.find(m => m.id === c.challenger_member_id);
        const b = members.find(m => m.id === c.opponent_member_id);
        const send = async (subject) => {
          const end = new Date(start + 90*60*1000);
          const ics = buildIcs({ uid: `match-${c.id}@tlnet`, startISO: new Date(start).toISOString(), endISO: end.toISOString(), title: 'Tennis Match', location: c.location, organizer: process.env.MAIL_FROM, attendees: [a?.email, b?.email].filter(Boolean) });
          const html = `<p>Reminder: Your match is scheduled for ${new Date(start).toLocaleString()} at ${c.location || 'TBD'}.</p>`;
          if (a?.email) await sendEmail({ to: a.email, subject, html, ics });
          if (b?.email) await sendEmail({ to: b.email, subject, html, ics });
        };
        if (!c.reminder24Sent && in24h) { await send('Match Reminder (24h)'); c.reminder24Sent = true; }
        if (!c.reminder1Sent && in1h) { await send('Match Reminder (1h)'); c.reminder1Sent = true; }
      }
      store.save();
    } catch (e) { /* ignore */ }
  }, 5 * 60 * 1000);
});
