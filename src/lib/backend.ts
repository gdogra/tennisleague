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
if (!storage.get(KEYS.members, null)) storage.set(KEYS.members, [] as any[]);

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
    getByUserId(userId: number): Result<any> {
      const members = storage.get<any[]>(KEYS.members, []);
      const found = members.find(m => m.user_id === userId) || null;
      return Promise.resolve({ data: found, error: null });
    },
    create(member: any): Result<any> {
      const members = storage.get<any[]>(KEYS.members, []);
      const created = { ...member, id: nextId('member') };
      members.push(created);
      storage.set(KEYS.members, members);
      return Promise.resolve({ data: created, error: null });
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

export default backend;
