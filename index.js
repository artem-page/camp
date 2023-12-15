'use strict'
const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require("body-parser")

const vhost = require('vhost')
const http = require('http')
const https = require('https')

const cors = require('cors')
const myRouter = require('./api/myRouter')

const app = express()
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// Mount static assets

app.use("/assets", express.static(path.join(__dirname, "public")))

// Define the home page route

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
})

// Middleware

app.use(myRouter)

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