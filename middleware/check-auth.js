const jwt = require("jsonwebtoken")
const HttpError = require("../models/http_error")


module.exports = (req, res, next) => {
    console.log("auth cheker middleware", req.headers.authorization)
    if (!req.headers.authorization) {
        console.log("no token, return")
        next(); 
        
    }else {
        try {
            const token = req.headers.authorization.split(" ")[1]
            if (!token) {
                console.log("no token")
                next();
                return; 
            }
            const decodedToken = jwt.verify(token, process.env.SECRET)
            console.log("decodedToken", decodedToken)
            req.userData = {
                userId: decodedToken.userId,
            }
            console.log("check auth: userId", decodedToken.userId)
            next();
        } catch(err) {
            console.log("auth middleware error", err)
            next();
            //const error = new HttpError('Authentication failed', 401)
            //return next(error)
        }
    }
    

}