require('dotenv').config()
let dns = require('node:dns')
let express = require("express")
let mongoose = require('mongoose')

let apiRouter = express()

let cors = require('cors')
apiRouter.use(cors({ optionsSuccessStatus: 200 })) // some legacy browsers choke on 204

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

function isValidUrl(url) {
    const urlPattern = /^(http:\/\/|https:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/)?$/
    return urlPattern.test(url)
}

function removeProtocol(url) {
    // Use a regular expression to remove "http://" or "https://"
    return url.replace(/^https?:\/\//, '');
}

// Regex
const reg1 = /^https:\/\//;
const reg2 = /^http:\/\//;
const reg3 = /\/$/;


// Plugin 

let mongooseIncrement = require("mongoose-increment")

let incrementPlugin = mongooseIncrement(mongoose)

let linkSchema = new mongoose.Schema({
    link: { type: String, required: true }
})

linkSchema.plugin(incrementPlugin, {
    modelName: 'link',
    fieldName: 'linkId',
    start: 1,
    increment: 1
})

let Link = mongoose.model('links', linkSchema)

apiRouter.post('/api/shorturl', (req, res) => {

    if (isValidUrl(req.body.url)) {

        let originalUrl = req.body.url
/*
        dns.lookup(originalUrl, (err, address) => {

            if (err) {
                //console.error(err);
                return res.json({ error: 'invalid url' })
            }
*/
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
                res.json({ original_url: originalUrl, short_url: shortUrl.linkId})
            })
            .catch(err => {
                console.error(err);
                // Handle the error appropriately
                //return done(err);
                res.status(500).json({ error: 'Internal Server Error' })
            });

//        })

    } else {
        return res.json({ error: 'invalid url' })
    }
   
})

apiRouter.get('/api/shorturl/:linkId?', async (req, res) => {

    Link.findOne({ linkId: req.params.linkId }, (err, data) => {

        if (err) {

            res.json({ error: 'Link not found' })

        } else {

            if (reg1.test(data.link) || reg2.test(data.link)) {

                res.redirect(data.link)

            } else {

                res.redirect("https://" + data.link)

            }
        }
    })

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