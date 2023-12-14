let express = require('express')
let api = express.Router()

api.use(function(req, res, next) {
    console.log(req.method+" "+req.path+" - "+req.ip);
    next();
});

api.get("/", (req, res) => {

    res.send('Hello Camp')

})

api.get("/api/:date", (req, res) => {

    let dateReq = isNaN(req.params.date) ? req.params.date : parseInt(req.params.date)
    let dateObj

    /* 
    The input arrives in the form of a string. While the new Date() function adeptly transforms it into a date, 
    it encounters difficulty when the string resembles a numeric value or Unix timestamp. 
    */
    
    if(req.params.date === "") {
        dateObj = new Date()
        res.json({ unix: dateObj.getTime(), utc: dateObj.toUTCString() })
    } else {
        dateObj = new Date(dateReq)
        if(dateObj.toUTCString() === "Invalid Date") {
            res.json({ error : "Invalid Date" })
        } else {
            res.json({ unix: dateObj.getTime(), utc: dateObj.toUTCString() })
        }
    }
  
})

module.exports = api