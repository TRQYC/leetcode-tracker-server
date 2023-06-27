


const logger = (req, res, next) => {
    console.log(new Date(), '[start]', req.method,  req.url,  'params', req.query, "body", req.body)
    let send = res.send;
    res.send = c => {
        console.log(new Date(), '[end]', res.statusCode, c )
        res.send = send;
        return res.send(c);
    }
    next()
}

module.exports = logger 