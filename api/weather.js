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
    
    app.get('/dateweather/:id/:fromDate/:toDate?', (req, res, next) => {
        dbWorker.getWeatherDataFromDateId(req.params.id, req.params.fromDate, req.params.toDate).then(weather => {
            res.status(status.OK).json(weather)
        }).catch(next)
    })

    app.get('/locationweather/:id', (req, res, next) => {
        dbWorker.getWeatherData(req.params.id).then(weather => {
            res.status(status.OK).json(weather)
        }).catch(next)
    })

    app.post('/addweather', (req, res, next) => {
        dbWorker.addWeatherToLocation(req.body.id, req.body.weatherData).then(weatherData => {
            res.status(status.OK).json(weatherData)
        }).catch(err =>  {
            console.error(`Monkeys are broken ${err}`)
            res.status(status.IM_A_TEAPOT).send({ error : err.message })
            next()
        })
    })

    app.post('/addlocation', (req, res, next) => {
        dbWorker.addLocation(req.body.city, req.body.country).then(newLocation => {
            res.status(status.OK).json(newLocation)
        }).catch(err => {
            console.error(`Monkeys are broken ${err}`)
            res.status(status.IM_A_TEAPOT).send({ error : err.message })
            next()
        })
    })

    app.delete('/removelocation', (req, res, next) => {
        dbWorker.removeLocation(req.body.id).then(removedLocationID => {
            res.status(status.OK).json(removedLocationID)
        }).catch(err => {
            console.error(`Monkeys are tired to remove entire location ${err}`)
            res.status(status.IM_A_TEAPOT).send({ error : err.message })
            next()
        })
    })
}

module.exports = Object.assign({}, {weatherApi})