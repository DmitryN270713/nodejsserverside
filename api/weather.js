'use strict'

const status = require('http-status')

const weatherApi = (app, weatherDB) => {
    const dbWorker = weatherDB

    app.get('/about', (req, res, next) => {
        res.send("Everyone likes monkeys")
    })

    app.get('/city/:name', (req, res, next) => {
        dbWorker.getLocationsByCity(req.params.name).then(locations => {
            res.status(status.OK).json(locations)
        }).catch(next)
    })

    app.get('/country/:name', (req, res, next) => {
        dbWorker.getLocationsByCountry(req.params.name).then(locations => {
            res.status(status.OK).json(locations)
        }).catch(next)
    })

    app.get('/locations/:name/:country', (req, res, next) => {
        dbWorker.getLocationByCountryCity(req.params.name, req.params.country).then(locations => {
            res.status(status.OK).json(locations)
        }).catch(next)
    })

    app.get('/alllocations/:toskip/:perreq', (req, res, next) => {
        dbWorker.getAllLocations(req.params.toskip, req.params.perreq).then(locations => {
            res.status(status.OK).json(locations)
        }).catch(next)
    })

    app.post('/addlocation', (req, res, next) => {
        dbWorker.addLocation(req.body.city, req.body.country).then(newLocation => {
            res.status(status.OK).json(newLocation)
        }).catch(next)
    })
}

module.exports = Object.assign({}, {weatherApi})