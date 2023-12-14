let express = require('express')
let app = express()

app.get("/api/:date", (req, res) => {

    let dateReq = isNaN(req.params.date) ? req.params.date : parseInt(req.params.date)
    let dateObj = new Date(dateReq)
    
    res.json({unix: dateObj.getTime(), utc: dateObj.toUTCString()})
  
})

module.exports = app