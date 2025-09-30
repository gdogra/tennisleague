import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db, nextId } from './storage.js';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Auth (demo)
app.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const store = db();
  const user = { id: 100, email, name: email.split('@')[0], roles: email.endsWith('@tennisleague.com') ? 'Admin' : 'Member' };
  store.data.sessions['token'] = user; // naive
  store.save();
  res.json({ token: 'token', user });
});
app.post('/auth/logout', (req, res) => {
  const store = db();
  delete store.data.sessions['token'];
  store.save();
  res.json({ ok: true });
});
app.get('/auth/user', (req, res) => {
  const store = db();
  res.json({ user: store.data.sessions['token'] || null });
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
  store.data.members[idx] = { ...store.data.members[idx], ...req.body };
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
  res.json(created);
});
app.patch('/challenges/:id/status', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  store.data.challenges[idx] = { ...store.data.challenges[idx], status: req.body.status, updated_at: new Date().toISOString() };
  store.save();
  res.json(store.data.challenges[idx]);
});
app.patch('/challenges/:id/schedule', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  store.data.challenges[idx] = { ...store.data.challenges[idx], proposed_date: req.body.proposed_date, location: req.body.location, updated_at: new Date().toISOString() };
  store.save();
  res.json(store.data.challenges[idx]);
});
app.post('/challenges/:id/slots', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const slots = (req.body.slots || []).map((s) => ({ id: nextId(store.data.chats), start: s.start, end: s.end }));
  store.data.challenges[idx] = { ...store.data.challenges[idx], proposed_slots: slots, updated_at: new Date().toISOString() };
  store.save();
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
  res.json(store.data.challenges[idx]);
});
app.post('/challenges/:id/report', (req, res) => {
  const store = db();
  const idx = store.data.challenges.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const c = store.data.challenges[idx];
  store.data.challenges[idx] = { ...c, status: 'ResultPending', verification_status: 'Pending', result_reported_by: req.body.winner_member_id, winner_member_id: req.body.winner_member_id, sets: req.body.sets, updated_at: new Date().toISOString() };
  store.save();
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
  res.json(created);
});

// Seasons/Courts
app.get('/seasons', (req, res) => { const store = db(); res.json(store.data.seasons); });
app.get('/courts', (req, res) => { const store = db(); res.json(store.data.courts); });

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
