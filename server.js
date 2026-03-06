const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const routeMap = {
  '/': 'index.html',
  '/index': 'index.html',
  '/about': 'about.html',
  '/otp': 'otp.html',
  '/home-page': 'index.html'
};

function safePathname(urlPathname) {
  try {
    return decodeURIComponent(urlPathname.split('?')[0]);
  } catch {
    return '/';
  }
}

function resolveFile(urlPathname) {
  const pathname = safePathname(urlPathname).replace(/\/+$/, '') || '/';
  const mapped = routeMap[pathname];
  if (mapped) {
    return path.join(publicDir, mapped);
  }
  let relativePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  if (!relativePath) {
    relativePath = 'index.html';
  }
  const filePath = path.normalize(path.join(publicDir, relativePath));
  if (!filePath.startsWith(publicDir)) {
    return null;
  }
  return filePath;
}

const server = http.createServer((req, res) => {
  const filePath = resolveFile(req.url || '/');
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
