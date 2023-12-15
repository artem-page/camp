'use strict'
const express = require('express')
const fs = require('fs')
const path = require('path')

const vhost = require('vhost')
const http = require('http')
const https = require('https')

const cors = require('cors')
const process = require('process')
const myRouter = require('./api/myRouter')

const app = express()

app.use(cors());

//app.use('/public', express.static(`${process.cwd()}/public`));

app.get("/", function(req, res, next) {
  res.sendFile(process.cwd() + "/views/index.html")
  next()
}, (req, res) => {
  let currDate = new Date()
  console.log( req.method+" "+req.path+" - "+req.ip+ " " + " | " + currDate.getHours() + ":" + currDate.getMinutes() + ":" + currDate.getSeconds() )
})

// Middleware

app.use(myRouter)

// Server

let sslServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/camp.r1a1.xyz/fullchain.pem')
}, app)

app.use(vhost("camp.r1a1.xyz", app))

const { port } = require('./config')

const listener = sslServer.listen(port, function (err) {
    if (err) console.log(err)
    console.log("Node.js listening on port " + listener.address().port)
})