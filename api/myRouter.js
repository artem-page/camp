let express = require("express")
let apiRouter = express()

let mongoose = require('mongoose')
const { mongoURI } = require('./config')
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })

// bodyParser

let bodyParser = require('body-parser')
apiRouter.use(bodyParser.urlencoded({ extended: false })); // When using extended=false, values can be only strings or arrays
apiRouter.use(bodyParser.json());

// timestamp-microservice: Parameters can be suffixed with a question mark ( ? ) to make the parameter optional

apiRouter.get("/api/timestamp-microservice/:date?", (req, res) => {
    
    let dateReq, dateObj

    /* 
    The input arrives in the form of a string. While the new Date() function adeptly transforms it into a date, 
    it encounters difficulty when the string resembles a numeric value or Unix timestamp. 
    */
    
    if(!req.params.date) {
        dateObj = new Date()
        res.json({ unix: dateObj.getTime(), utc: dateObj.toUTCString() })
    } else {
        dateReq = isNaN(req.params.date) ? req.params.date : parseInt(req.params.date)
        dateObj = new Date(dateReq)
        if(dateObj.toUTCString() === "Invalid Date") {
            res.json({ error : "Invalid Date" })
        } else {
            res.json({ unix: dateObj.getTime(), utc: dateObj.toUTCString() })
        }
    }
     
})

// request-header-parser

apiRouter.get('/api/request-header-parser/whoami', (req, res) => {
    let clientHeaders = req.headers
    let clientIP = req.socket.remoteAddress.replace(/^.*:/, "")  // removing ::ffff:

    res.json({ ipaddress: clientIP, language: clientHeaders["accept-language"], software: clientHeaders["user-agent"] })
})

// shorturl-microservice

let linkSchema = new mongoose.Schema({
    original_url: {type: String, required: true}
})

let Link = mongoose.model('Link', linkSchema)

let newLink = new Link

apiRouter.post('/api/shorturl', (req, res) => {
    newLink = req.body.original_url
    res.json({ original_url: newLink, short_url: ''})
})

module.exports = apiRouter