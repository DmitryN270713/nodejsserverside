'use strict'

const {EventEmitter} = require('events')

const config = require('./config/config')
const mongoDBConnector = require('./database/mongodbconnector')
const weatherDB = require('./database/weatherdb')
const weatherServer = require('./server/weather-server')

const eventEmmiter = new EventEmitter()

process.on('uncaughtException', (err) => {
    console.error('Unpredictable behavior', err)
})

process.on('SIGINT', () => {
    weatherServer.close(() => {
        process.exit(0)
    })
})

eventEmmiter.on('DB_READY', (db) => {
    let _dbWorker

    weatherDB.establishConnection(db).then(dbWorker => {
        _dbWorker = dbWorker
        console.log('Connected to DB')

        return weatherServer.startServer(config.serverSettings, _dbWorker)
    }).then(server => {
        console.log(`Monkeys are up and running through the port: ${config.serverSettings.port}.`)
        server.on('close', () => {
            _dbWorker.disconnect()
        })
    })
})

eventEmmiter.on('DB_ERROR', (err) => {
    console.error(err)
})

// Try to establish connection to database
mongoDBConnector.establishConnection(config.databaseSettings, eventEmmiter)
eventEmmiter.emit('RUN_DB')

console.log("Weather microservice. Start...")