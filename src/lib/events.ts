const API_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;

type Handler = (evt: any) => void;

class EventBus {
  es: EventSource | null = null;
  handlers: Handler[] = [];
  start() {
    if (!API_BASE || typeof window === 'undefined' || !('EventSource' in window)) return;
    if (this.es) return;
    this.es = new EventSource(`${API_BASE}/events`);
    this.es.onmessage = (e) => {
      try { const data = JSON.parse(e.data); this.handlers.forEach(h => h(data)); } catch {}
    };
    this.es.onerror = () => { /* keep alive; browser will reconnect */ };
  }
  on(handler: Handler) {
    this.handlers.push(handler);
    this.start();
    return () => { this.handlers = this.handlers.filter(h => h !== handler); };
  }
}

export const events = new EventBus();

