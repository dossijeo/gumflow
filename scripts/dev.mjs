/** Local development server. Refresh the browser to rebuild edited sources. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, writeWeb, sha256 } from './lib/build.mjs';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || '5173');
const args = process.argv.slice(2);
const crazygames = args.includes('--crazygames');
if(crazygames) args.splice(args.indexOf('--crazygames'), 1);
const { writeCrazyGames } = crazygames ? await import('./lib/crazygames-build.mjs') : {};
if (args.includes('--help')) {
  console.log('npm run dev [-- --crazygames]\nDefault http://127.0.0.1:5173\nUse PORT / HOST environment variables to change the bind address.\nRefresh the page after editing src/, web/ or assets/.');
  process.exit(0);
}
if (args.length || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Invalid arguments or PORT. Use --help.'); process.exit(1);
}
const publicRoot = path.join(ROOT, crazygames ? 'dist/crazygames' : 'dist/web');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.json': 'application/json; charset=utf-8' };
let version = '';
function signature() {
  const entries = [];
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
      if (e.isSymbolicLink()) throw new Error('Unexpected source symlink: ' + e.name);
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else { const s = fs.statSync(p); entries.push(`${p}:${s.mtimeMs}:${s.size}`); }
    }
  };
  for (const dir of ['src','web','assets','config']) walk(path.join(ROOT, dir));
  return sha256(entries.join('\n'));
}
function rebuild() {
  const next = signature();
  if (version !== next) { (crazygames ? writeCrazyGames : writeWeb)(); version = next; console.log('Built web files.'); }
}
try { rebuild(); } catch (e) { console.error(e.message); process.exit(1); }
const server = http.createServer((req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (requestPath === '/' || requestPath === '/index.html') rebuild();
    const destination = path.resolve(publicRoot, '.' + (requestPath === '/' ? '/index.html' : requestPath));
    if (!destination.startsWith(publicRoot + path.sep) || !fs.existsSync(destination) || !fs.statSync(destination).isFile()) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const real = fs.realpathSync(destination);
    if (!real.startsWith(fs.realpathSync(publicRoot) + path.sep)) { res.writeHead(403); res.end(); return; }
    const data = fs.readFileSync(real);
    const headers = { 'Content-Type': mime[path.extname(real)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
    if (req.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      const first = match ? Number(match[1]) : -1, last = match && match[2] ? Math.min(Number(match[2]), data.length-1) : data.length-1;
      if (first < 0 || first > last || first >= data.length) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${data.length}` }); res.end(); return; }
      res.writeHead(206, { ...headers, 'Content-Length': last-first+1, 'Content-Range': `bytes ${first}-${last}/${data.length}` });
      res.end(req.method === 'HEAD' ? undefined : data.subarray(first,last+1)); return;
    }
    res.writeHead(200, { ...headers, 'Content-Length': data.length }); res.end(req.method === 'HEAD' ? undefined : data);
  } catch (e) { console.error(e); res.writeHead(500, { 'Content-Type':'text/plain; charset=utf-8' }); res.end('Build/server error. See the terminal.'); }
});
server.on('error', e => { console.error(e.message); process.exitCode=1; });
server.listen(port, host, () => console.log(`GUMFLOW: http://${host}:${port}\nRefresh after edits. Ctrl+C stops the server.`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
