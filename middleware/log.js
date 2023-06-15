


const logger = (req, res, next) => {
    console.log('new request start', new Date(), 'params', req.query, 'body', req.body)
    next()
    console.log('new request end', new Date(), "body is", res.body)
}

module.exports = logger 