const express = require('express')
const {EventEmitter} = require('events')
const config = require('./config/config')
const mongoDBConnector = require('./database/mongodbconnector')
const weatherDB = require('./database/weatherdb').default

const eventEmmiter = new EventEmitter()

process.on('uncaughtException', (err) => {
    console.error('Unpredictable behavior', err)
})

process.on('uncaughtRejection', (err, promise) => {
    console.error('Unhandled Rejection', err)
})

eventEmmiter.on('DB_READY', (db) => {
    weatherDB.establishConnection(db)
})

eventEmmiter.on('DB_ERROR', (err) => {
    console.error(err)
})

// Try to establish connection to database
mongoDBConnector.establishConnection(config.databaseSettings, eventEmmiter)
eventEmmiter.emit('RUN_DB')

// Testing... TODO: remove later


console.log("Weather microservice. Start...")


const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))