'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
// At some point it might be needed somewhere. Monkey see, monkey do ;)
const morgan = require('morgan')
const helmet = require('helmet')
const https = require('https')

const errorHandler = require('../api/errorhandler')
const api = require('../api/weather')

const startServer = (options, dbWorker) => {
    return new Promise((resolve, reject) => {
        if (!options.port) {
            reject(new Error('The server must be started with an available port'))
        }
  
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

        app.use(morgan('dev'))
        app.use(helmet())
        app.use((err, req, res, next) => {
            reject(new Error('Something went wrong!, err:' + err))
            res.status(500).send('Something went wrong!')
        })
  
        api.weatherApi(app, dbWorker)

        let server
        if (options.useSsl) {
            server = https.createServer(options.ssl, app)
            server.listen(options.port, () => resolve(server))
        } else {
            server = app.listen(options.port, () => resolve(server))
        }
    })
  }

  module.exports = Object.assign({}, {startServer})