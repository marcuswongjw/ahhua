import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { initialState, applyOp, getTableSession } from './src/domain.js';

const base = resolve(process.env.SERVE_DIST ? 'dist' : '.');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

let sharedState = initialState();
let stateVersion = 0;
const clients = new Set();

function isValidState(candidate) {
  return candidate?.version === 1 && ['cart', 'orders', 'messages', 'calls', 'unavailable', 'proposal'].every(k => Array.isArray(candidate[k]));
}

function broadcast(senderId = '', op = null) {
  stateVersion++;
  const payload = `data: ${JSON.stringify({ state: sharedState, version: stateVersion, clients: clients.size, senderId, op })}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch { clients.delete(res); }
  }
}

function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 262144) { req.destroy(); rejectBody(new Error('Payload too large')); }
    });
    req.on('end', () => {
      try { resolveBody(raw ? JSON.parse(raw) : {}); } catch (e) { rejectBody(e); }
    });
    req.on('error', rejectBody);
  });
}

export async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });
    clients.add(res);
    res.write(`data: ${JSON.stringify({ state: sharedState, version: stateVersion, clients: clients.size, senderId: 'init' })}\n\n`);
    broadcast('presence');
    req.on?.('close', () => {
      clients.delete(res);
      broadcast('presence');
    });
    return;
  }

  // Atomic operation endpoint: processes ADD_LINE, UPDATE_QTY, SUBMIT, etc. without overwriting other tables
  if (pathname === '/api/op' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const op = body?.op;
      if (!op || !op.type) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Missing operation payload' }));
        return;
      }
      applyOp(sharedState, op);
      broadcast(String(body?.senderId || ''), op);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, version: stateVersion, clients: clients.size }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message || 'Operation failed' }));
    }
    return;
  }

  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ state: sharedState, version: stateVersion, clients: clients.size }));
    return;
  }

  if (pathname === '/api/state' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      const incoming = body?.state ?? body;
      if (!isValidState(incoming)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid state payload' }));
        return;
      }
      // Merge table sessions cleanly so one table doesn't wipe another table's cart
      if (incoming.sessions && typeof incoming.sessions === 'object') {
        if (!sharedState.sessions) sharedState.sessions = {};
        for (const [tId, sess] of Object.entries(incoming.sessions)) {
          sharedState.sessions[tId] = sess;
        }
      }
      // Merge root cart if provided
      if (Array.isArray(incoming.cart)) {
        sharedState.cart = incoming.cart;
      }
      if (Array.isArray(incoming.orders)) sharedState.orders = incoming.orders;
      if (Array.isArray(incoming.calls)) sharedState.calls = incoming.calls;
      if (Array.isArray(incoming.unavailable)) sharedState.unavailable = incoming.unavailable;
      if (Array.isArray(incoming.messages)) sharedState.messages = incoming.messages;
      if (Array.isArray(incoming.proposal)) sharedState.proposal = incoming.proposal;

      broadcast(String(body?.senderId || ''));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, clients: clients.size }));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Malformed JSON body' }));
    }
    return;
  }

  const path = resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!path.startsWith(base + '/')) { res.writeHead(403).end(); return; }
  try { res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'text/plain; charset=utf-8' }); res.end(await readFile(path)); }
  catch { res.writeHead(404).end('Not found'); }
}

export function createServer() {
  return http.createServer(handleRequest);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT) || 4173;
  createServer().listen(port, '127.0.0.1', () => console.log(`Ah Hua: http://127.0.0.1:${port}`));
}
