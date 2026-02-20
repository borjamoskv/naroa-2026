
import 'dotenv/config';
import http from 'http';
import chatHandler from '../api/chat.js';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    try {
      // Collect body
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const body = Buffer.concat(buffers).toString();

      // Mock a Web Standard Request object
      const fullUrl = `http://localhost:${PORT}${req.url}`;
      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers: new Headers(req.headers),
        body: body,
      });

      // Call the Vercel handler
      const webResponse = await chatHandler(webRequest);

      // Send response back
      res.writeHead(webResponse.status, {
        'Content-Type': 'application/json',
      });
      
      const responseText = await webResponse.text();
      res.end(responseText);

    } catch (err) {
      console.error('Local API Error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  Logger.debug(`🔮 Local API Server running at http://localhost:${PORT}`);
});
