const dbClient = require('mongodb').MongoClient

const getURL = (options) => {
    const url = options.servers
                .reduce((accumulator, current) => accumulator + current + ',', 'mongodb://')

    return `${url.substr(0, url.length - 1)}/${options.db}`
}

// This solves the issue with "the server/replset/mongos options are deprecated"
const getSettingsObject = (options) => {
    const settings = {
        // Resolves depricated URL parser warning
        useNewUrlParser: true,
        // Resolves current Server Discovery and Monitoring engine is deprecated
        useUnifiedTopology: true
    }

    // Add db parameters
    Object.assign(settings, options.dbParams())
    // Add server parameters
    Object.assign(settings, options.serverParams())

    return settings
}

const establishConnection = (options, eventEmmiter) => {
    eventEmmiter.once('RUN_DB', () => {
        dbClient.connect(
            getURL(options), 
            getSettingsObject(options),
            (err, client) => {
                if (err) {
                    console.error('Monkeys are not doing their job...')
                    eventEmmiter.emit('DB_ERROR', err)
                }

                // TO DO: Authentication goes here...
                // For now just emit DB_READY signal
                eventEmmiter.emit('DB_READY', client.db(options.db))
            }
        )
    })
}

module.exports = Object.assign({}, {establishConnection})