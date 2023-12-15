'use strict';

const express = require('express');
const app = express();

const vhost = require('vhost');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");

const http = require('http');
const https = require('https');

var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

/* Mounting body-parser 
app.use(bodyParser.urlencoded({ extended: false })); // When using extended=false, values can be only strings or arrays
app.use(bodyParser.json());
*/
// Mounting static assets
//app.use( '/assets', express.static(__dirname + '/assets') )

// Sending index page to the root path
app.get('/', function (req, res) {
  //res.send('Hello Camp')
  res.sendFile(__dirname + '/public/index.html');
});

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
