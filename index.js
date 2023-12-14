'use strict';

const express = require('express');
const app = express();
const vhost = require('vhost');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const router = express.Router();
const http = require('http');
const https = require('https');

var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

const api = require('./api/myAPI');
app.use(api);


let sslServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/fullchain.pem')
}, app);

app.use(vhost("camp.r1a1.xyz", app));
 
const { port } = require('./config');
  
const listener = sslServer.listen(port, function () {
    console.log("Node.js listening on port " + listener.address().port);
});
