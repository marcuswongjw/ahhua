import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const base = resolve(process.env.SERVE_DIST ? 'dist' : '.');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const path = resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!path.startsWith(base + '/')) { res.writeHead(403).end(); return; }
  try { res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'text/plain' }); res.end(await readFile(path)); }
  catch { res.writeHead(404).end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log('Ah Hua: http://127.0.0.1:4173'));
