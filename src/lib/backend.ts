// A lightweight in-browser backend for local/static deployments.
// Persists to localStorage so the app works on static hosts (Netlify/Render).

type Result<T> = Promise<{ data: T | null; error: string | null }>;

const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Seed data
const seed = {
  categories: [
    { id: 1, name: 'Apparel', description: 'League shirts and gear' },
    { id: 2, name: 'Accessories', description: 'Balls, grips and more' },
    { id: 3, name: 'Equipment', description: 'Rackets and strings' }
  ],
  products: [
    {
      id: 1001,
      name: 'TLSD Performance Tee',
      description: 'Breathable performance tee with TLSD logo',
      category_id: 1,
      brand: 'TLSD',
      model: 'Tee 2025',
      price: 24.99,
      sale_price: 19.99,
      is_on_sale: true,
      stock_quantity: 25,
      low_stock_threshold: 5,
      weight: 200,
      dimensions: '30x20x2cm',
      color_options: 'White,Black,Green',
      size_options: 'S,M,L,XL',
      main_image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
        'https://images.unsplash.com/photo-1520975922284-7b683db4c36b?w=800'
      ]),
      specifications: JSON.stringify({ Fabric: 'Polyester', Fit: 'Athletic' }),
      features: 'Moisture wicking, Lightweight',
      is_featured: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 1002,
      name: 'Premium Tennis Balls (Can of 3)',
      description: 'USTA-approved premium balls for hard courts',
      category_id: 2,
      brand: 'AcePro',
      model: 'Hard Court',
      price: 6.99,
      sale_price: 0,
      is_on_sale: false,
      stock_quantity: 100,
      low_stock_threshold: 10,
      weight: 300,
      dimensions: '25x8x8cm',
      color_options: '',
      size_options: '',
      main_image: 'https://images.unsplash.com/photo-1563281577-a6d393a9417a?w=800',
      additional_images: JSON.stringify([]),
      specifications: JSON.stringify({ Bounce: 'High', Court: 'Hard' }),
      features: 'Durable felt',
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Keys
const KEYS = {
  user: 'app_user',
  members: 'app_members',
  categories: 'app_categories',
  products: 'app_products',
  challenges: 'app_challenges',
  outbox: 'app_outbox',
  seasons: 'app_seasons',
  seasonMembers: (seasonId: number) => `app_season_${seasonId}_members`,
  cart: (memberId: number) => `app_cart_${memberId}`,
  orders: (memberId: number) => `app_orders_${memberId}`,
  orderItems: (orderId: number) => `app_order_items_${orderId}`,
  ids: 'app_ids'
};

const ids = storage.get(KEYS.ids, {
  member: 1,
  cartItem: 1,
  order: 1,
  orderItem: 1
});

function nextId(key: keyof typeof ids) {
  // @ts-ignore
  const v = (ids[key] as number) + 1;
  // @ts-ignore
  ids[key] = v;
  storage.set(KEYS.ids, ids);
  return v;
}

// Initialize seed data once
if (!storage.get(KEYS.categories, null)) storage.set(KEYS.categories, seed.categories);
if (!storage.get(KEYS.products, null)) storage.set(KEYS.products, seed.products);
if (!storage.get(KEYS.members, null)) {
  // Seed a few example members to enable challenges/browsing
  const now = new Date().toISOString();
  const demoMembers = [
    { id: nextId('member'), user_id: 201, name: 'Alex Kim', tennis_rating: 4.0, area: 'North County', email: 'alex@example.com', is_active: true, joined_at: now },
    { id: nextId('member'), user_id: 202, name: 'Jordan Lee', tennis_rating: 3.5, area: 'Downtown', email: 'jordan@example.com', is_active: true, joined_at: now },
    { id: nextId('member'), user_id: 203, name: 'Riley Chen', tennis_rating: 4.5, area: 'East County', email: 'riley@example.com', is_active: true, joined_at: now }
  ];
  storage.set(KEYS.members, demoMembers as any[]);
}
if (!storage.get(KEYS.challenges, null)) storage.set(KEYS.challenges, [] as any[]);
if (!storage.get(KEYS.seasons, null)) {
  const now = new Date();
  const year = now.getFullYear();
  const demo = [
    { id: 1, name: `${year} Fall`, start: new Date(year, 9, 1).toISOString(), end: new Date(year, 11, 15).toISOString(), divisions: ['3.5','4.0','4.5','5.0'], is_active: true }
  ];
  storage.set(KEYS.seasons, demo);
  storage.set(KEYS.seasonMembers(1), [] as any[]);
}
if (!storage.get(KEYS.outbox, null)) storage.set(KEYS.outbox, [] as any[]);

// Types
export interface User { ID: number; Name: string; Email: string; CreateTime?: string; Roles?: string }

export const backend = {
  auth: {
    getUserInfo(): Result<User> {
      const user = storage.get<User | null>(KEYS.user, null);
      return Promise.resolve({ data: user, error: null });
    },
    login({ email, password }: { email: string; password: string }): Result<User> {
      if (!email || !password) return Promise.resolve({ data: null, error: 'Missing credentials' });
      const name = email.split('@')[0];
      const user: User = { ID: 100, Name: name, Email: email, CreateTime: new Date().toISOString(), Roles: 'Member' };
      storage.set(KEYS.user, user);
      return Promise.resolve({ data: user, error: null });
    },
    logout(): Result<true> {
      localStorage.removeItem(KEYS.user);
      return Promise.resolve({ data: true, error: null });
    },
    register({ email, password }: { email: string; password: string }): Result<User> {
      if (!email || !password) return Promise.resolve({ data: null, error: 'Missing registration fields' });
      const name = email.split('@')[0];
      const user: User = { ID: 100, Name: name, Email: email, CreateTime: new Date().toISOString(), Roles: 'Member' };
      storage.set(KEYS.user, user);
      // Auto-create a member record if one doesn't exist
      const members = storage.get<any[]>(KEYS.members, []);
      if (!members.find(m => m.user_id === user.ID)) {
        members.push({ id: nextId('member'), user_id: user.ID, is_active: true, joined_at: new Date().toISOString() });
        storage.set(KEYS.members, members);
      }
      return Promise.resolve({ data: user, error: null });
    },
    resetPassword(_: { token: string; password: string }): Result<true> {
      return Promise.resolve({ data: true, error: null });
    }
  },

  members: {
    list(): Result<any[]> {
      const members = storage.get<any[]>(KEYS.members, []);
      return Promise.resolve({ data: members, error: null });
    },
    getByUserId(userId: number): Result<any> {
      const members = storage.get<any[]>(KEYS.members, []);
      const found = members.find(m => m.user_id === userId) || null;
      return Promise.resolve({ data: found, error: null });
    },
    create(member: any): Result<any> {
      const members = storage.get<any[]>(KEYS.members, []);
      const created = { wins: 0, losses: 0, ...member, id: nextId('member') };
      members.push(created);
      storage.set(KEYS.members, members);
      return Promise.resolve({ data: created, error: null });
    },
    update(id: number, patch: any): Result<any> {
      const members = storage.get<any[]>(KEYS.members, []);
      const idx = members.findIndex(m => m.id === id);
      if (idx === -1) return Promise.resolve({ data: null, error: 'Not found' });
      members[idx] = { ...members[idx], ...patch, updated_at: new Date().toISOString() };
      storage.set(KEYS.members, members);
      return Promise.resolve({ data: members[idx], error: null });
    }
  },

  challenges: {
    listForMember(memberId: number): Result<{ incoming: any[]; outgoing: any[] }> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const incoming = all.filter(c => c.opponent_member_id === memberId).sort((a,b)=>a.created_at.localeCompare(b.created_at)).reverse();
      const outgoing = all.filter(c => c.challenger_member_id === memberId).sort((a,b)=>a.created_at.localeCompare(b.created_at)).reverse();
      return Promise.resolve({ data: { incoming, outgoing }, error: null });
    },
    create(payload: { challenger_member_id: number; opponent_member_id: number; proposed_date?: string; location?: string; message?: string; season_id?: number; division?: string; }): Result<any> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const now = new Date().toISOString();
      const created = {
        id: Date.now(),
        status: 'Pending',
        verification_status: 'None',
        created_at: now,
        updated_at: now,
        ...payload
      };
      all.push(created);
      storage.set(KEYS.challenges, all);
      // email stub notifications
      try {
        const members = storage.get<any[]>(KEYS.members, []);
        const challenger = members.find(m => m.id === payload.challenger_member_id);
        const opponent = members.find(m => m.id === payload.opponent_member_id);
        emailStubSend(
          opponent?.email || `user+${payload.opponent_member_id}@example.com`,
          'New Match Challenge',
          `${challenger?.name || 'A player'} challenged you.${payload.proposed_date ? ` When: ${payload.proposed_date}.` : ''}${payload.location ? ` Where: ${payload.location}.` : ''} ${payload.message || ''}`
        );
        emailStubSend(
          challenger?.email || `user+${payload.challenger_member_id}@example.com`,
          'Challenge Sent',
          `You challenged ${opponent?.name || 'a player'}. We'll notify you upon response.`
        );
      } catch {}
      return Promise.resolve({ data: created, error: null });
    },
    acceptSchedule(id: number): Result<any> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const idx = all.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve({ data: null, error: 'Not found' });
      all[idx] = { ...all[idx], status: 'Accepted', updated_at: new Date().toISOString() };
      storage.set(KEYS.challenges, all);
      return Promise.resolve({ data: all[idx], error: null });
    },
    updateStatus(id: number, status: 'Accepted' | 'Declined' | 'Cancelled' | 'Completed'): Result<any> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const idx = all.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve({ data: null, error: 'Not found' });
      all[idx] = { ...all[idx], status, updated_at: new Date().toISOString() };
      storage.set(KEYS.challenges, all);
      try {
        const c = all[idx];
        const members = storage.get<any[]>(KEYS.members, []);
        const challenger = members.find(m => m.id === c.challenger_member_id);
        const opponent = members.find(m => m.id === c.opponent_member_id);
        emailStubSend(
          challenger?.email || `user+${c.challenger_member_id}@example.com`,
          `Challenge ${status}`,
          `${opponent?.name || 'Opponent'} ${status.toLowerCase()} your challenge.`
        );
      } catch {}
      return Promise.resolve({ data: all[idx], error: null });
    },
    reportResult(id: number, payload: { winner_member_id: number; sets: Array<{ a: number; b: number }>; }): Result<any> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const idx = all.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve({ data: null, error: 'Not found' });
      const updated = { ...all[idx], status: 'ResultPending', verification_status: 'Pending', result_reported_by: payload.winner_member_id, winner_member_id: payload.winner_member_id, sets: payload.sets, updated_at: new Date().toISOString() };
      all[idx] = updated;
      storage.set(KEYS.challenges, all);
      return Promise.resolve({ data: updated, error: null });
    },
    verifyResult(id: number, approve: boolean, note?: string): Result<any> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const idx = all.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve({ data: null, error: 'Not found' });
      let updated = all[idx];
      if (approve) {
        updated = { ...updated, status: 'Completed', verification_status: 'Verified', updated_at: new Date().toISOString() };
        // Update member stats
        const members = storage.get<any[]>(KEYS.members, []);
        const winIdx = members.findIndex(m => m.id === updated.winner_member_id);
        if (winIdx !== -1) members[winIdx] = { ...members[winIdx], wins: (members[winIdx].wins || 0) + 1 };
        const loserId = updated.challenger_member_id === updated.winner_member_id ? updated.opponent_member_id : updated.challenger_member_id;
        const loseIdx = members.findIndex(m => m.id === loserId);
        if (loseIdx !== -1) members[loseIdx] = { ...members[loseIdx], losses: (members[loseIdx].losses || 0) + 1 };
        storage.set(KEYS.members, members);
      } else {
        updated = { ...updated, verification_status: 'Contested', contest_note: note || '', updated_at: new Date().toISOString() };
      }
      all[idx] = updated;
      storage.set(KEYS.challenges, all);
      return Promise.resolve({ data: updated, error: null });
    },
    listAdmin(): Result<{ pending: any[]; contested: any[] }> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const pending = all.filter(c => c.status === 'ResultPending' || c.verification_status === 'Pending');
      const contested = all.filter(c => c.verification_status === 'Contested');
      return Promise.resolve({ data: { pending, contested }, error: null });
    },
    adminOverride(id: number, winner_member_id: number): Result<any> {
      const all = storage.get<any[]>(KEYS.challenges, []);
      const idx = all.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve({ data: null, error: 'Not found' });
      let updated = { ...all[idx], winner_member_id, status: 'Completed', verification_status: 'Verified', updated_at: new Date().toISOString() };
      all[idx] = updated;
      storage.set(KEYS.challenges, all);
      // Update stats
      const members = storage.get<any[]>(KEYS.members, []);
      const winIdx = members.findIndex(m => m.id === winner_member_id);
      if (winIdx !== -1) members[winIdx] = { ...members[winIdx], wins: (members[winIdx].wins || 0) + 1 };
      const loserId = updated.challenger_member_id === winner_member_id ? updated.opponent_member_id : updated.challenger_member_id;
      const loseIdx = members.findIndex(m => m.id === loserId);
      if (loseIdx !== -1) members[loseIdx] = { ...members[loseIdx], losses: (members[loseIdx].losses || 0) + 1 };
      storage.set(KEYS.members, members);
      return Promise.resolve({ data: updated, error: null });
    }
  },

  categories: {
    list(): Result<any[]> {
      const cats = storage.get<any[]>(KEYS.categories, seed.categories);
      return Promise.resolve({ data: cats, error: null });
    }
  },

  products: {
    list(): Result<any[]> {
      const products = storage.get<any[]>(KEYS.products, seed.products);
      return Promise.resolve({ data: products, error: null });
    },
    getById(id: number): Result<any> {
      const products = storage.get<any[]>(KEYS.products, seed.products);
      const found = products.find(p => p.id === id) || null;
      return Promise.resolve({ data: found, error: null });
    }
  },

  files: {
    getUploadUrl(ref: string | number): Result<string> {
      // In local mode, just return a placeholder URL
      return Promise.resolve({ data: String(ref), error: null });
    }
  },

  cart: {
    list(memberId: number): Result<any[]> {
      const items = storage.get<any[]>(KEYS.cart(memberId), []);
      return Promise.resolve({ data: items, error: null });
    },
    find(memberId: number, productId: number, color = '', size = ''): Result<any> {
      const items = storage.get<any[]>(KEYS.cart(memberId), []);
      const found = items.find(i => i.product_id === productId && i.selected_color === color && i.selected_size === size) || null;
      return Promise.resolve({ data: found, error: null });
    },
    create(memberId: number, payload: any): Result<any> {
      const items = storage.get<any[]>(KEYS.cart(memberId), []);
      const created = { id: nextId('cartItem'), member_id: memberId, ...payload };
      items.push(created);
      storage.set(KEYS.cart(memberId), items);
      return Promise.resolve({ data: created, error: null });
    },
    update(memberId: number, id: number, changes: any): Result<any> {
      const items = storage.get<any[]>(KEYS.cart(memberId), []);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) return Promise.resolve({ data: null, error: 'Not found' });
      items[idx] = { ...items[idx], ...changes };
      storage.set(KEYS.cart(memberId), items);
      return Promise.resolve({ data: items[idx], error: null });
    },
    delete(memberId: number, id: number): Result<true> {
      const items = storage.get<any[]>(KEYS.cart(memberId), []);
      const next = items.filter(i => i.id !== id);
      storage.set(KEYS.cart(memberId), next);
      return Promise.resolve({ data: true, error: null });
    },
    clear(memberId: number): Result<true> {
      storage.set(KEYS.cart(memberId), []);
      return Promise.resolve({ data: true, error: null });
    }
  },

  orders: {
    list(memberId: number): Result<any[]> {
      const orders = storage.get<any[]>(KEYS.orders(memberId), []);
      return Promise.resolve({ data: orders, error: null });
    },
    create(memberId: number, order: any, items: any[]): Result<any> {
      const orders = storage.get<any[]>(KEYS.orders(memberId), []);
      const id = nextId('order');
      const created = { ...order, id };
      orders.push(created);
      storage.set(KEYS.orders(memberId), orders);

      // store items
      const orderItems = items.map((it) => ({ ...it, id: nextId('orderItem'), order_id: id }));
      storage.set(KEYS.orderItems(id), orderItems);

      return Promise.resolve({ data: created, error: null });
    },
    items(orderId: number): Result<any[]> {
      const items = storage.get<any[]>(KEYS.orderItems(orderId), []);
      return Promise.resolve({ data: items, error: null });
    }
  }
};

// Email notification stub
function emailStubSend(to: string, subject: string, body: string) {
  const out = storage.get<any[]>(KEYS.outbox, []);
  const item = { id: Date.now(), to, subject, body, created_at: new Date().toISOString() };
  out.push(item);
  storage.set(KEYS.outbox, out);
  // eslint-disable-next-line no-console
  console.log('[EmailStub]', item);
}

export default backend;
