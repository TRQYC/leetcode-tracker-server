


const logger = (req, res, next) => {
    console.log(new Date(), '[start]', req.method,  req.url,  'params', req.query, "body", req.body)
    next()
}

module.exports = logger 