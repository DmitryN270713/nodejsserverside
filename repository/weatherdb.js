'use strict'

// DB worker
const dbWorker = (db) => {
    const collection = db.collection('weathercollection')

    // Disconnect from DB
    const disconnect = () => {
        db.close()
    }

}

const establishConnection = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection) {
            reject(new Error("connection object was not provided"))
        }
        resolve(dbWorker(connection))
    })
}

module.exports = Object.assign({}, {establishConnection})