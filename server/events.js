const clients = new Set();

export function sseHandler(req, res) {
  const token = (req.headers.cookie || '').split('; ').find(s=>s.startsWith('sid='))?.split('=')[1] || (new URL(req.url, 'http://localhost')).searchParams.get('token');
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(`: connected\n\n`);
  const client = { res, token };
  clients.add(client);
  req.on('close', () => {
    clients.delete(client);
  });
}

export function broadcast(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const c of clients) {
    try { c.res.write(data); } catch {}
  }
}

export function broadcastSelective(predicate, event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const c of clients) {
    try { if (predicate(c)) c.res.write(data); } catch {}
  }
}
