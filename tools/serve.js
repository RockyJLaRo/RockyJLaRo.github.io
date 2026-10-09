#!/usr/bin/env node
/*
 * Tiny local web server for previewing the Outfitter (no installs needed).
 *
 *   node tools/serve.js          -> http://localhost:8080
 *   node tools/serve.js 3000     -> http://localhost:3000
 *
 * Why a server at all? The Outfitter downloads its sprite files (base64/...)
 * with JavaScript, and browsers block that when index.html is opened directly
 * from disk (file://). Any static server works; this one just has no
 * dependencies. Press Ctrl+C to stop it.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.argv[2] || process.env.PORT || '8080', 10);
const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let urlPath;
    try {
        urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch (e) {
        res.writeHead(400);
        res.end('Bad request');
        return;
    }
    if (urlPath.endsWith('/')) { urlPath += 'index.html'; }
    const filePath = path.join(ROOT, urlPath);
    // never serve files outside the project folder
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found: ' + urlPath);
            return;
        }
        res.writeHead(200, {
            'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store' // always show your latest edits
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log('Outfitter running at http://localhost:' + PORT + '/  (press Ctrl+C to stop)');
});
