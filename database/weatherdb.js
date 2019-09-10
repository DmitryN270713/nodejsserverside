'use strict'

const sha1 = require('sha1')

// DB worker
const dbWorker = (db) => {

    const collection = db.collection('weathercollection')

    const getLocationsByCity = (name) => {
        return new Promise((resolve, reject) => {
            const projection = {_id: 0, weather: 0}
            const locations = []
            const addLocation = (location) => {
                locations.push(location)
            }
            const sendLocation = (err) => {
                if (err) {
                    reject(new Error(`An error occured fetching location by name: ${name}, err: ${err}`))
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
                    reject(new Error(`An error occured fetching location by name: ${name}, err: ${err}`))
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
                    reject(new Error(`An error occured fetching location by city: ${name} and country: ${country}, err: ${err}`))
                }
                
                resolve(location)
            }
            console.log(collection.findOne({ name: name, country: country }, { projection: projection }, sendLocation))
        })
    }

    // Asumes that it is unique location
    // TO DO: fix it
    const addLocation = (name, country) => {
        return new Promise((resolve, reject) => {
            const sendInsertLocation = (err, newLocation) => {
                if (err) {
                    reject(new Error('An error occured adding new location'))
                }
                
                resolve(newLocation)
            }
            //TO DO: hash generation from city and country
            collection.insertOne({id: sha1(name), name: name, country: country, weather: [{date: new Date(), pressure: 0, temperature: 0, humidity: 0}]}, sendInsertLocation)
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
        addLocation,
        disconnect
    })
}

const establishConnection = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection) {
            reject(new Error("connection object was not provided"))
        }

        resolve(dbWorker(connection))
    }).catch((err) => {
        console.error(err)
    })
}

module.exports = Object.assign({}, {establishConnection})