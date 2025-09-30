const API_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;

type Result<T> = Promise<{ data: T | null; error: string | null }>;

async function http<T>(path: string, opts?: RequestInit): Result<T> {
  try {
    if (!API_BASE) return { data: null, error: 'API not configured' } as any;
    const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, credentials: 'include', ...opts });
    if (!res.ok) return { data: null, error: `${res.status}` } as any;
    const data = await res.json();
    return { data, error: null } as any;
  } catch (e: any) {
    return { data: null, error: e?.message || 'network_error' } as any;
  }
}

const backendApi = {
  auth: {
    async getUserInfo() {
      const { data, error } = await http<{ user: any }>(`/auth/user`);
      if (error) return { data: null, error };
      const u = data?.user;
      if (!u) return { data: null, error: null };
      return { data: { ID: u.id || 100, Name: u.name, Email: u.email, Roles: u.roles }, error: null };
    },
    async login({ email, password }: { email: string; password: string }) {
      const { data, error } = await http<{ token: string; user: any }>(`/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) });
      if (error) return { data: null, error };
      const u = data?.user;
      return { data: { ID: u.id || 100, Name: u.name, Email: u.email, Roles: u.roles }, error: null };
    },
    async logout() { return http(`/auth/logout`, { method: 'POST' }) as any; },
    async register({ email, password }: { email: string; password: string }) { return this.login({ email, password }); },
    async resetPassword(_: { token: string; password: string }) { return { data: true, error: null }; }
  },
  members: {
    async list() { const { data, error } = await http<any[]>(`/members`); return { data: data || [], error: error || null }; },
    async getByUserId(userId: number) { const { data, error } = await http<any>(`/members/by-user/${userId}`); return { data: data || null, error: error || null }; },
    async create(member: any) { const { data, error } = await http<any>(`/members`, { method: 'POST', body: JSON.stringify(member) }); return { data: data || null, error: error || null }; },
    async update(id: number, patch: any) { const { data, error } = await http<any>(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }); return { data: data || null, error: error || null }; }
  },
  challenges: {
    async listForMember(memberId: number) { const { data, error } = await http<any>(`/challenges/member/${memberId}`); return { data: data || { incoming: [], outgoing: [] }, error: error || null }; },
    async create(payload: any) { const { data, error } = await http<any>(`/challenges`, { method: 'POST', body: JSON.stringify(payload) }); return { data: data || null, error: error || null }; },
    async updateStatus(id: number, status: any) { const { data, error } = await http<any>(`/challenges/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); return { data: data || null, error: error || null }; },
    async updateSchedule(id: number, proposed_date?: string, location?: string) { const { data, error } = await http<any>(`/challenges/${id}/schedule`, { method: 'PATCH', body: JSON.stringify({ proposed_date, location }) }); return { data: data || null, error: error || null }; },
    async reportResult(id: number, payload: any) { const { data, error } = await http<any>(`/challenges/${id}/report`, { method: 'POST', body: JSON.stringify(payload) }); return { data: data || null, error: error || null }; },
    async verifyResult(id: number, approve: boolean, note?: string) { const { data, error } = await http<any>(`/challenges/${id}/verify`, { method: 'POST', body: JSON.stringify({ approve, note }) }); return { data: data || null, error: error || null }; },
    async listAdmin() { const { data, error } = await http<any>(`/challenges/admin`); return { data: data || { pending: [], contested: [] }, error: error || null }; },
    async adminOverride(id: number, winner_member_id: number) { const { data, error } = await http<any>(`/challenges/${id}/override`, { method: 'POST', body: JSON.stringify({ winner_member_id }) }); return { data: data || null, error: error || null }; }
  },
  schedule: {
    async proposeSlots(id: number, slots: Array<{ start: string; end?: string }>) { const { data, error } = await http<any>(`/challenges/${id}/slots`, { method: 'POST', body: JSON.stringify({ slots }) }); return { data: data || null, error: error || null }; },
    async acceptSlot(id: number, slotId: number, location?: string) { const { data, error } = await http<any>(`/challenges/${id}/accept-slot`, { method: 'POST', body: JSON.stringify({ slotId, location }) }); return { data: data || null, error: error || null }; }
  },
  chats: {
    async list(challengeId: number) { const { data, error } = await http<any[]>(`/chats/${challengeId}`); return { data: data || [], error: error || null }; },
    async add(challengeId: number, sender_member_id: number, message: string) { const { data, error } = await http<any>(`/chats/${challengeId}`, { method: 'POST', body: JSON.stringify({ sender_member_id, message }) }); return { data: data || null, error: error || null }; }
  },
  seasons: {
    async list() { const { data, error } = await http<any[]>(`/seasons`); return { data: data || [], error: error || null }; }
  },
  courts: {
    async list() { const { data, error } = await http<any[]>(`/courts`); return { data: data || [], error: error || null }; }
  },
  // Not implemented on API; return empty/supported defaults
  notifications: { async listOutbox() { return { data: [], error: null }; } },
  categories: { async list() { return { data: [], error: null }; } },
  products: { async list() { return { data: [], error: null }; }, async getById(_: number) { return { data: null, error: null }; } },
  files: { async getUploadUrl(ref: string | number) { return { data: String(ref), error: null }; } },
  cart: { async list() { return { data: [], error: null }; } },
  orders: { async list() { return { data: [], error: null }; } }
};

export default backendApi;
