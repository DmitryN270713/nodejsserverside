'use strict'

const fs = require('fs')

module.exports = {
  key: fs.readFileSync(`${__dirname}/privateKey.key`),
  cert: fs.readFileSync(`${__dirname}/server.crt`)
}