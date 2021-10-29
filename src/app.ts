import express from 'express';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import Config from './config.class';
import findHandler from './route-handler.module';
import proxyRequest from './http-proxy.module';

// Setup express and disable cors
const app = express();
app.use(cors());

// Listen on all paths with all methods
app.all(/.*/, (req, res) => {
  // Try to find a handler for this hostname, path and protocol
  const handler = findHandler(
    req.hostname,
    req.path,
    req.secure,
  );

  // No handler found
  if (handler === null) {
    // Redirect to HTTPS version of requested URL
    if (!req.secure && Config.settings.upgradeUnknownRequests) {
      res.redirect(`https://${req.hostname}${req.originalUrl}`);
      return;
    }

    // Unknown endpoint
    res.statusCode = 404;
    res.send('Unknown endpoint! Please try another sub-domain or path!');
    return;
  }

  // Proxy this valid request
  try {
    proxyRequest(req, res, handler);
  } catch (e) {
    res.statusCode = 500;
    res.send('An internal error occurred while relaying your request!');
  }
});

// Listen on port 80
http.createServer(app).listen(80);

// Listen on port 443
const crtDir = Config.settings.letsEncryptDir;
https.createServer({
  key: fs.readFileSync(`${path.join(crtDir, 'privkey.pem')}`, 'utf8'),
  cert: fs.readFileSync(`${path.join(crtDir, 'cert.pem')}`, 'utf8'),
  ca: fs.readFileSync(`${path.join(crtDir, 'chain.pem')}`, 'utf8'),
}, app).listen(443);

// Notify of status
console.log('Listening for HTTP / HTTPS requests!');
