import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'server', 'data.json');

function ensure() {
  if (!fs.existsSync(FILE)) {
    const now = new Date().toISOString();
    const seed = {
      users: [],
      members: [
        { id: 201, user_id: 201, name: 'Alex Kim', tennis_rating: 4.0, rating_elo: 1500, area: 'North County', email: 'alex@example.com', wins: 0, losses: 0, is_active: true, joined_at: now, availability: defaultAvailability() },
        { id: 202, user_id: 202, name: 'Jordan Lee', tennis_rating: 3.5, rating_elo: 1500, area: 'Downtown', email: 'jordan@example.com', wins: 0, losses: 0, is_active: true, joined_at: now, availability: defaultAvailability() },
        { id: 203, user_id: 203, name: 'Riley Chen', tennis_rating: 4.5, rating_elo: 1500, area: 'East County', email: 'riley@example.com', wins: 0, losses: 0, is_active: true, joined_at: now, availability: defaultAvailability() }
      ],
      sessions: {},
      challenges: [],
      chats: [],
      seasons: [{ id: 1, name: `${new Date().getFullYear()} Fall`, start: new Date().toISOString(), end: new Date().toISOString(), divisions: ['3.5','4.0','4.5','5.0'], is_active: true }],
      seasonMembers: { '1': [] },
      courts: [
        { id: 1, name: 'Balboa Tennis Club', area: 'Downtown', surface: 'Hard', lights: true },
        { id: 2, name: 'La Jolla Tennis Center', area: 'North County', surface: 'Hard', lights: true },
        { id: 3, name: 'Morley Field', area: 'Central', surface: 'Hard', lights: true }
      ]
    };
    fs.writeFileSync(FILE, JSON.stringify(seed, null, 2));
  }
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function db() {
  const data = read();
  return {
    data,
    save: () => write(data)
  };
}

export function nextId(arr) {
  return (arr.reduce((m, it) => Math.max(m, it.id || 0), 0) || 0) + 1;
}

function defaultAvailability() {
  return Array.from({ length: 7 }).map((_, i) => ({ day: i, enabled: false, start: '17:00', end: '20:00' }));
}

