const http = require('http');
const fs = require('fs');
const path = require('path');
const contributors = require('./api/contributors');

const PORT = 3000;

http.createServer((req, res) => {
  // Simple router to match Vercel API behavior
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  } else if (url.pathname === '/index.css') {
    const css = fs.readFileSync(path.join(__dirname, 'public', 'index.css'));
    res.setHeader('Content-Type', 'text/css');
    res.end(css);
  } else if (url.pathname.startsWith('/api/contributors')) {
    // Mimic Vercel query parsing
    req.query = Object.fromEntries(url.searchParams);
    
    // Provide a basic send() method that Vercel injects
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
