'use strict'



const errorHandler = () => {    

    const logErrors = (err, req, res, next) => {
        console.error(`Our monkey got broken... ${err.stack}`)
        next(err)
    }

    const errorHandler = (err, req, res, next) => {
        if (res.headersSent) {
            return next(err)
        } 
        res.status(500)
        res.render('error', { error: err })
    }

    return Object.create({
        logErrors,
        errorHandler
    })
}

module.exports = Object.assign({}, {errorHandler})