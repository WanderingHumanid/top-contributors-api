const http = require('http');
const contributors = require('./api/contributors');

const PORT = 3000;

http.createServer((req, res) => {
  // Simple router to match Vercel API behavior
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname.startsWith('/api/contributors')) {
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
    res.end('Not Found. Try /api/contributors?username=vishnunandan555');
  }
}).listen(PORT, () => {
  console.log(`🚀 Local dev server running at: http://localhost:${PORT}`);
  console.log(`👉 Test endpoint: http://localhost:${PORT}/api/contributors?username=vishnunandan555`);
});
