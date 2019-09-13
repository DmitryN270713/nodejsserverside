const express = require('express')
const {EventEmitter} = require('events')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const config = require('./config/config')
const mongoDBConnector = require('./database/mongodbconnector')
const weatherDB = require('./database/weatherdb')
const api = require('./api/weather')
const errorHandler = require('./api/errorhandler')

const eventEmmiter = new EventEmitter()

process.on('uncaughtException', (err) => {
    console.error('Unpredictable behavior', err)
})

// TO DO: move to the server.js
const app = express()

// Allow nested objects
app.use(bodyParser.urlencoded({
    extended: true
}))

// Parse Application/json
app.use(bodyParser.json())
app.use(methodOverride())
app.use(errorHandler.errorHandler().logErrors)
app.use(errorHandler.errorHandler().errorHandler)

const port = 3000

eventEmmiter.on('DB_READY', (db) => {
    //TO DO: Use to disconnect from DB
    let _dbWorker

    weatherDB.establishConnection(db).then(dbWorker => {
        _dbWorker = dbWorker
        console.log('Connected to DB')
        // TO DO: add server here

        api.weatherApi(app, dbWorker)
    })
})

eventEmmiter.on('DB_ERROR', (err) => {
    console.error(err)
})

// Try to establish connection to database
mongoDBConnector.establishConnection(config.databaseSettings, eventEmmiter)
eventEmmiter.emit('RUN_DB')

// Testing... TODO: remove later


console.log("Weather microservice. Start...")


app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))