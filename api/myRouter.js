require('dotenv').config()
let dns = require('node:dns')
let express = require("express")
let mongoose = require('mongoose')
let apiRouter = express()

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// Check if the connection is successful
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB');
})

// bodyParser 

let bodyParser = require('body-parser')
apiRouter.use(bodyParser.urlencoded({ extended: false })) // When using extended=false, values can be only strings or arrays
apiRouter.use(bodyParser.json())

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

const Link = mongoose.model('link', {link: String})

function removeProtocol(url) {
    // Use a regular expression to remove "http://" or "https://"
    return url.replace(/^https?:\/\//, '');
}

apiRouter.post('/api/shorturl', (req, res) => {

    let originalUrl = removeProtocol(req.body.original_url)

    let newRecord = new Link({
        link: originalUrl
    })

    /*
    The save function in Mongoose is asynchronous, so you can't directly assign its result to a variable. 
    Instead, you should use a callback or Promises to handle the asynchronous nature of the operation.
    */

    newRecord.save()
    .then(result => {
        let shortUrl = result; // Assuming 'result' contains the saved document
        // Now you can use 'shortUrl' as needed
        //return done(null, shortUrl);
        res.json({ original_url: originalUrl, short_url: shortUrl.id})
    })
    .catch(err => {
        console.error(err);
        // Handle the error appropriately
        //return done(err);
        res.status(500).json({ error: 'Internal Server Error' })
    });


    let ipAddress = dns.lookup(originalUrl, (err, address, family) => {
        return address
    })

    
})

apiRouter.get('/api/shorturl/:idtofind?', (req, res) => {

    if(req.params.idtofind) {

        let idToFind = req.params.idtofind

        // Using findById to find a record by id
        Link.findById( idToFind )
        .then(foundRecord => {
            if (foundRecord) {
                // The record was found, do something with it
                //res.json({link: foundRecord.link})

                res.redirect('https://'+foundRecord.link)

            } else {
                // No record found with the specified id
                res.json({result: 'Record not found'})
            }
        })
        .catch(error => {
            // Handle any errors that occurred during the findOne operation
            console.error(error)
        })

    } else {

        res.json({ error: 'Please specify the short url as a parameter' })

    }

})

// list mongobd collections

apiRouter.get('/api/collections/:collection?', async (req, res) => {

    if(!req.params.collection) {

        try {
            // Get the list of collections
            const collections = await mongoose.connection.db.listCollections().toArray();
            
            // Extract collection names from the list
            const collectionNames = collections.map(collection => collection.name);
        
            res.json({ collections: collectionNames })

        } catch (error) {

            console.error('Error fetching collections:', error)

            res.status(500).json({ error: 'Internal Server Error' })

        }
    } else {

        try {

            let collectionContent = await mongoose.connection.db.collection(req.params.collection).find().toArray()

            res.json({ collection: collectionContent})

        } catch (error) {

            console.error('Error fetching links:', error)

            res.status(500).json({ error: 'Internal Server Error' })
        }

    }

})

module.exports = apiRouter