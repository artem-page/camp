let express = require('express')
let api = express.Router()

api.use(function(req, res, next) {
    console.log(req.method+" "+req.path+" - "+req.ip);
    next();
});

api.get("/api/:date", (req, res) => {

    let dateReq = isNaN(req.params.date) ? req.params.date : parseInt(req.params.date)
    let dateObj = new Date(dateReq)
    
    res.json({unix: dateObj.getTime(), utc: dateObj.toUTCString()})
  
})

module.exports = api