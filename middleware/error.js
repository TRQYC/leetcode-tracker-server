module.exports = (error, req, res, next) => {
    console.log("error middle ware", error)
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.statusCode || 500)
    res.json({code: error.code, message: error.message|| 'An unknown error occurred!'})
}