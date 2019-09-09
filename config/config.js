'use strict'

const databaseSettings = {
    db: process.env.DB || 'weatherdb',
    user: process.env.DB_USER || '',
    pass: process.env.DB_PASS || '',
    servers: (process.env.DB_SERVERS) ? process.env.DB_SERVERS.split(' ') : ['localhost:27017'],

    dbParams: () => ({
        w: "majority",
        wtimeout: 10000,
        j: true,
        readPreference: 'nearest',
        native_parser: false
    }),

    serverParams: () => ({
        autoReconnect: true,
        poolSize: 7,
        keepAlive: 300,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000
    }),

    replsetParams: (replicaSetName = 'weatherReplica') => ({
        replicaSet: replicaSetName,
        ha: true,
        haInterval: 10000,
        poolSize: 7,
        socketoptions: {
            keepAlive: 300,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000
        }
    })
}


module.exports = Object.assign({}, {databaseSettings})