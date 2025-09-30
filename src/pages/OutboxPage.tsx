import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import backend from '@/lib/backend';

export default function OutboxPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      // Reuse backend.notifications.listOutbox via dynamic call (attached under backend as notifications in previous patch?)
      const fn = (backend as any).notifications?.listOutbox;
      if (fn) {
        const { data } = await fn();
        setItems(data || []);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Notification Outbox (Dev)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.length === 0 && <div className="text-sm text-gray-600">No notifications yet.</div>}
              {items.map((it) => (
                <div key={it.id} className="border rounded p-3">
                  <div className="text-xs text-gray-500">{new Date(it.created_at).toLocaleString()}</div>
                  <div className="font-medium">To: {it.to}</div>
                  <div className="font-semibold">{it.subject}</div>
                  <div className="text-sm whitespace-pre-wrap">{it.body}</div>
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

