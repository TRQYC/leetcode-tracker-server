


const logger = (req, res, next) => {
    console.log('new request start', "url", req.url, new Date(), 'params', req.query)
    next()
    console.log('new request end', new Date(), "body is", res.body)
}

module.exports = logger 