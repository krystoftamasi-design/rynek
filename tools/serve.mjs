import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { networkInterfaces } from 'node:os';
import { previewHost, previewPort, phoneAddresses } from './preview-config.mjs';

// Normalize the trailing slash so the path-safety check works on Windows too.
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (request.method === 'HEAD') response.end();
    else response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Nenalezeno');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Port 4173 is already in use. Close the previous Na Rynku server window and start again.'
    : `Server could not start: ${error.code || error.message}`);
  process.exitCode = 1;
});

server.listen(previewPort, previewHost, () => {
  console.log('\nNA RYNKU - MOBILE PREVIEW\n');
  console.log(`Computer: http://127.0.0.1:${previewPort}/`);
  let addresses = [];
  try { addresses = phoneAddresses(networkInterfaces()); } catch { /* Restricted environments may hide interfaces. */ }
  if (addresses.length) {
    console.log('\nOpen on your phone (same Wi-Fi):');
    for (const address of addresses) console.log(`  ${address}`);
  } else {
    console.log('\nPhone: http://YOUR_COMPUTER_WIFI_IPV4:4173/');
    console.log('Find the computer Wi-Fi IPv4 address in Windows network settings.');
  }
  console.log('\nKeep this window open. Stop with Ctrl+C.');
  console.log('If Windows asks, allow Node.js on PRIVATE networks only.');
  console.log('This preview exposes only the dist folder to devices on your network.\n');
});
