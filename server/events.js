const clients = new Set();

export function sseHandler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(`: connected\n\n`);
  const client = { res };
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

