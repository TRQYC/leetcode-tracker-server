


const logger = (req, res, next) => {
    console.log('request start', "url", req.url, new Date(), 'params', req.query, "body", req.body)
    next()
    console.log('request end', new Date(), "status", res.status)
}

module.exports = logger 