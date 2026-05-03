const http = require('http');
const fs = require('fs');
const path = require('path');
const contributors = require('./api/contributors');

const PORT = 3000;

http.createServer((req, res) => {
  // Simple router to match Vercel API behavior
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Determine if we should serve a static file from public/
  const staticPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(__dirname, 'public', staticPath);
  
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.js': 'text/javascript'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.end(fs.readFileSync(filePath));
  } else if (url.pathname.startsWith('/api/contributors')) {
    // Mimic Vercel query parsing
    req.query = Object.fromEntries(url.searchParams);
    
    // Provide basic send/status methods that Vercel injects
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };
    
    res.send = (body) => {
      if (typeof body === 'object') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      } else {
        res.end(body);
      }
    };
    
    // Call the serverless function
    contributors(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found. Try /api/contributors');
  }
}).listen(PORT, () => {
  console.log(`🚀 Local dev server running at: http://localhost:${PORT}`);
  console.log(`👉 Test endpoint: http://localhost:${PORT}/api/contributors`);
});
