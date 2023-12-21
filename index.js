'use strict'
const express = require('express')
const fs = require('fs')
const path = require('path')

const http = require('http')
const https = require('https')

const cors = require('cors')
const process = require('process')
const myRouter = require('./api/myRouter')

const app = express()

app.use(cors({ optionsSuccessStatus: 200 })) // some legacy browsers choke on 204

app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

// Test - React - Development files

app.use('/randomquotemachine/', express.static(path.join(process.cwd(), 'dev', 'dist', 'randomquotemachine')))

app.get('/randomquotemachine', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'dev', 'dist', 'randomquotemachine', 'randomquotemachine.html'));
})

// Middleware

app.use(myRouter)

// Server

let sslServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/fullchain.pem')
}, app)

const { port } = require('./config')

const listener = sslServer.listen(port, function (err) {
    if (err) console.log(err)
    console.log("Node.js listening on port " + listener.address().port)
})