'use strict';

const myAPI = require('./api/myAPI');

const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");

const http = require('http');
const https = require('https');

var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

let sslServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/fullchain.pem')
}, app);
 
const { port } = require('./config');
  
const listener = sslServer.listen(port, function () {
    console.log("Node.js listening on port " + listener.address().port);
});
