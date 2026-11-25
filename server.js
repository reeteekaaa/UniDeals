const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    let safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    
    let filePath = path.join(DIR, safePath);
    let ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`UniDeals server running at http://localhost:${PORT}/`);
});
