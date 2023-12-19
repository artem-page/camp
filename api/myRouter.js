require('dotenv').config()
let dns = require('node:dns')
let express = require("express")
let mongoose = require('mongoose')
let bodyParser = require('body-parser')
const AutoIncrement = require('mongoose-sequence')(mongoose)

let apiRouter = express()
apiRouter.use(bodyParser.urlencoded({ extended: false })) // When using extended=false, values can be only strings or arrays
apiRouter.use(bodyParser.json())

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

// Schema

const urlSchema = new mongoose.Schema({
    original_url: { type: String, required: true },
    short_url: { type: Number, unique: true }
})

// Apply the increment plugin to generate auto-incrementing numbers
urlSchema.plugin(AutoIncrement, { inc_field: 'short_url' })


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]
})

const exerciseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: String,
    duration: Number,
    date: { type: String, default: Date.now }
}, {
    versionKey: false
})

// Model

const Url = mongoose.model('Url', urlSchema)
//const Link = mongoose.model('links', linkSchema)

const User = mongoose.model('User', userSchema)

const Exercise = mongoose.model('Exercise', exerciseSchema)



/*
    TIMESTAMP MICROSERVICE
*/

//Parameters can be suffixed with a question mark ( ? ) to make the parameter optional

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

/*
    REQUEST HEADER PARSER
*/

apiRouter.get('/api/request-header-parser/whoami', (req, res) => {

    let clientHeaders = req.headers
    let clientIP = req.socket.remoteAddress.replace(/^.*:/, "")  // removing ::ffff:

    res.json({ ipaddress: clientIP, language: clientHeaders["accept-language"], software: clientHeaders["user-agent"] })

})


/*
    URL SHORTENER MICROSERVICE
*/

// Middleware to handle invalid URLs

const urlPattern = /^(http|https)(:\/\/)/;

const isValidUrl = (url) => {
    try {
        const urlObject = new URL(url)
        const isMatchPattern = urlPattern.test(url)
        return isMatchPattern
    } catch (error) {
        return false
    }
}

const validateUrl = (req, res, next) => {
  const { url } = req.body

  if (!isValidUrl(url)) {
    res.json({ error: 'invalid url' })
  } else {
    next()
  }
}

// Create a short URL
apiRouter.post('/api/shorturl', validateUrl, async (req, res) => {

    try {

        const { url } = req.body

        // Check if the URL is already in the database
        let urlEntry = await Url.findOne({ original_url: url })

        if (!urlEntry) {
            
            // Create a new URL entry
            urlEntry = new Url({ original_url: url })

            await urlEntry.save()

        }

        res.json({
            original_url: urlEntry.original_url,
            short_url: urlEntry.short_url
        })

    } catch (error) {

        res.status(500).json({ error: error.message })

    }
});
  
// Redirect to the original URL
apiRouter.get('/api/shorturl/:short_url', async (req, res) => {

    try {

        const { short_url } = req.params

        const urlEntry = await Url.findOne({ short_url })
        
        if (urlEntry) {

            res.redirect(urlEntry.original_url)

        } else {

            res.json({ error: 'Short URL not found' })

        }

    } catch (error) {

        res.status(500).json({ error: error.message })

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

/*
    EXERCISE TRACKER
*/

// Create a new user
apiRouter.post('/api/users', async (req, res) => {

    try {

        const { username } = req.body

        const user = new User({ username })

        const savedUser = await user.save()

        res.json(savedUser)

    } catch (error) {

        res.status(400).json({ error: error.message })

    }
})

// Get all users
apiRouter.get('/api/users', async (req, res) => {

    try {

        const users = await User.find()

        res.json(users)

    } catch (error) {

        res.status(500).json({ error: error.message })

    }
})

// Add exercise for a user
apiRouter.post('/api/users/:_id/exercises', async (req, res) => {
    try {
        const { _id } = req.params
        const { description, duration, date } = req.body
        const userId = mongoose.Types.ObjectId(_id)

        const exercise = new Exercise({ userId, description, duration, date })

        const savedExercise = await exercise.save()

        // Find the user and update the exercises array
        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { exercises: savedExercise } },
            { new: true } // Return the updated user
        )

        const response = {
            _id: user._id,
            username: user.username,
            date: savedExercise.date.toDateString(),
            duration: savedExercise.duration,
            description: savedExercise.description
        }

        res.json(response)

    } catch (error) {

        res.status(500).json({ error: error.message })

    }
})
  
// Get full exercise log of a user
apiRouter.get('/api/users/:_id/logs', async (req, res) => {
    try {

        const { _id } = req.params
        const { from, to, limit } = req.query
        const userId = mongoose.Types.ObjectId(_id)

        const user = await User.findById(userId).populate({
            path: 'exercises',
            select: 'description duration date -_id',
            match: {
                date: { $gte: from || new Date(0), $lte: to || new Date() }
            },
            options: { limit: limit ? parseInt(limit, 10) : 0 }
        })

        if (!user) {
            return res.json({ error: 'User not found' })
        }

        const log = user.exercises.map((exercise) => ({
            description: String(exercise.description), // Ensure it's a string
            duration: Number(exercise.duration), // Ensure it's a number
            date: exercise.date.toDateString()
        }))

        const response = {
            username: user.username,
            count: log.length,
            _id: user._id,
            log
        }

        res.json(response)

    } catch (error) {

        res.status(500).json({ error: error.message })

    }
})

// Export

module.exports = apiRouter