let express = require('express')
let api = express.Router()

app.get('/', (req, res, next) => {
    let string = `${req.method} ${req.path} - ${req.ip}`
    console.log(string) 
    next();
}, (req, res) => {
    res.send('Hello Camp')
})

api.get("/api/:date", (req, res) => {

    let dateReq = isNaN(req.params.date) ? req.params.date : parseInt(req.params.date)
    let dateObj = new Date(dateReq)
    
    res.json({unix: dateObj.getTime(), utc: dateObj.toUTCString()})
  
})

module.exports = api