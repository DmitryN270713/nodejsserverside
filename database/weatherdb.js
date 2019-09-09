'use strict'

const sha1 = require('sha1')

// DB worker
const dbWorker = (db) => {
    const collection = db.collection('weathercollection')

    const getLocation = (name) => {
        return new Promise((resolve, reject) => {
            const projection = { _id: 0, id: 1, name: 1 }
            const sendLocation = (err, location) => {
                if (err) {
                    reject(new Error(`An error occured fetching location by name: ${name}, err: ${err}`))
                }
                
                resolve(location)
            }
            collection.findOne({ name: name }, projection, sendLocation)
        })
    }

    // Asumes that it is unique location
    // TO DO: fix it
    const addLocation = (name) => {
        return new Promise((resolve, reject) => {
            const sendInsertLocation = (err, newLocation) => {
                if (err) {
                    reject(new Error('An error occured adding new location'))
                }
                
                resolve(newLocation)
            }

            collection.insertOne({id: sha1(name), name: name, weather: [{date: new Date(), pressure: 0, temperature: 0, humidity: 0}]})
        })
    }

    // Disconnect from DB
    const disconnect = () => {
        db.close()
    }

    return Object.create({
        getLocation,
        addLocation,
        disconnect
    })
}

const establishConnection = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection) {
            reject(new Error("connection object was not provided"))
        }
    }).then(() => {
        resolve(dbWorker(connection))
    }).catch((err) => {
        console.error(err)
    })
}

module.exports = Object.assign({}, {establishConnection})