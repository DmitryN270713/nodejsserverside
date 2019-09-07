const express = require('express')
// Testing... TODO: remove later
const config = require('./config/config')
const mongo = require('./api/mongodbconnector')

mongo.establishConnection(config.databaseSettings)

const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))