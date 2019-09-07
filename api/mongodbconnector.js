const dbClient = require('mongodb').MongoClient

const establishConnection = (options, eventHandler) => {
    console.log(options.dbParams())
}

module.exports = Object.assign({}, {establishConnection})