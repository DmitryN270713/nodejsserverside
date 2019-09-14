'use strict'

const sha1 = require('sha1')

// DB worker
const dbWorker =  async (db) => {

    const collection = db.collection('weathercollection')
    await collection.createIndex({ id: 1 }, { sparse: true, unique: true })

    const getAllLocations = (toskip, perreq) => {
        return new Promise((resolve, reject) => {
            const projection = {_id: 0, weather: 0}
            const locations = []
            const addLocation = (location) => {
                locations.push(location)
            }
            const sendLocation = (err) => {
                if (err) {
                    return reject(new Error(`An error occured fetching all locations: ${err}`))
                }
                
                resolve(locations.slice())
            }
            const cursor = collection.aggregate([{ $skip: parseInt(toskip) }, { $limit: parseInt(perreq)}, { $project: projection}])
            cursor.forEach(addLocation, sendLocation)
        })
    }

    const getLocationsByCity = (name) => {
        return new Promise((resolve, reject) => {
            const projection = {_id: 0, weather: 0}
            const locations = []
            const addLocation = (location) => {
                locations.push(location)
            }
            const sendLocation = (err) => {
                if (err) {
                    return reject(new Error(`An error occured fetching location by name: ${name}, err: ${err}`))
                }
                
                resolve(locations.slice())
            }
            const cursor = collection.find({ name: name }).project(projection)
            cursor.forEach(addLocation, sendLocation)
        })
    }

    const getLocationsByCountry = (name) => {
        return new Promise((resolve, reject) => {
            const projection = { _id: false, weather: false }
            const locations = []
            const addLocation = (location) => {
                locations.push(location)
            }
            const sendLocation = (err) => {
                if (err) {
                    return reject(new Error(`An error occured fetching location by name: ${name}, err: ${err}`))
                }
                
                resolve(locations.slice())
            }
            const cursor = collection.find({ country: name }).project(projection)
            cursor.forEach(addLocation, sendLocation)
        })
    }

    const getLocationByCountryCity = (name, country) => {
        return new Promise((resolve, reject) => {
            const projection = { _id: 0, weather: 0 }
            const sendLocation = (err, location) => {
                if (err) {
                    return reject(new Error(`An error occured fetching location by city: ${name} and country: ${country}, err: ${err}`))
                }
                
                resolve(location)
            }
            collection.findOne({ name: name, country: country }, { projection: projection }, sendLocation)
        })
    }

    const getWeatherData = (id) => {
        return new Promise((resolve, reject) => {
            const projection = { _id: 0, id: 0 }
            
            const sendWeather = (err, weather) => {
                if (err) {
                    return reject(new Error(`An error occured fetching weather for: ${id}, err: ${err}`))
                }
                
                resolve(weather)
            }

            collection.findOne({ id: id }, { projection: projection }, sendWeather)
        })
    }

    const getWeatherDataFromDateId = (id, fromDate, toDate) => {
        return new Promise((resolve, reject) => {
            const projection = { _id: 0, id: 0 }
            const weatherInfo = []
            const addWeather = (weather) => {
                console.log(weather)
                weatherInfo.push(weather)
            }
            
            const sendWeather = (err) => {
                if (err) {
                    return reject(new Error(`An error occured fetching weather for: ${id}, err: ${err}`))
                }
                
                resolve(weatherInfo.slice())
            }

            // If toDate is undefined, then retrieve all data until the present
            let cursor = null
            console.log(fromDate + " " + toDate)
            if (!toDate) {
                cursor = collection.aggregate([{ $unwind: "$weather" }, { $match: { date: {$gte: new Date(fromDate)} } }, { $project: projection}])
            } else {
               /* cursor = collection.aggregate([ { $unwind: "$weather" }, 
                                                      {$and: [{ date: {$gte: new Date(fromDate)} },
                                                              { date: {$lte: new Date(fromDate)} }
                                                            ]},
                                                      { $project: projection } ])*/
            }

            cursor.forEach(addWeather, sendWeather)
        })
    }

    // Asumes that it is unique location
    // TO DO: fix it
    const addLocation = (name, country) => {
        return new Promise((resolve, reject) => {
            const sendInsertLocation = (err, newLocation) => {
                if (err) {
                    return reject(new Error(`An error occured adding new location ${err}`))
                }
                
                resolve(newLocation)
            }
            
            collection.insertOne({ id: sha1(name + country), name: name, country: country, 
                                   weather: [{date: new Date(), pressure: 0, temperature: 0, humidity: 0}] }, sendInsertLocation)
        })
    }

    // Disconnect from DB
    const disconnect = () => {
        db.close()
    }

    return Object.create({
        getLocationByCountryCity,
        getLocationsByCountry,
        getLocationsByCity,
        getAllLocations,
        getWeatherData,
        getWeatherDataFromDateId,
        addLocation,
        disconnect
    })
}

const establishConnection = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection) {
            return reject(new Error("connection object was not provided"))
        }

        resolve(dbWorker(connection))
    }).catch((err) => {
        console.error(err)
    })
}

module.exports = Object.assign({}, {establishConnection})