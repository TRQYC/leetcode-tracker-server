const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const HttpError = require('../models/http_error')
const error = require('../middleware/error')
const checkAuth = require('../middleware/check-auth')
const signup = async (request, response, next) => {
    const {name, email, password } = request.body
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        console.log("existing, pass error to next")
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError(
            'UserEmail exists already, please login instead.',
            422
        );
        return next(error);
    }

    const saltRounds = 10
    try {
        const passwordHash = await bcrypt.hash(password, saltRounds)
        const savedUser = await User.create({
            name, 
            email,
            passwordHash,
            site: 'us',
        })
        const userForToken = {
            userId: savedUser.id,
        }
        const token = jwt.sign(userForToken, process.env.SECRET)
        response
            .status(201)
            .send({ userId: savedUser.id, token })
    } catch (error) {
        next(error)
    }
}


const login =  async (request, response, next) => {
    const { email, password } = request.body
    
    const existedUser = await User.findOne({ email })
    console.log("get user is", existedUser)
    const passwordCorrect = existedUser === null
      ? false
      : await bcrypt.compare(password, existedUser.passwordHash)
  
    if (!(existedUser && passwordCorrect)) {
       return next(new HttpError('invalid username or password', 401))
    }
  
    const userForToken = {
      userId: existedUser.id,
    }
  
    const token = jwt.sign(userForToken, process.env.SECRET)
  
    response
      .status(200)
      .send({ userId: existedUser.id, token})
  }
  
async function getUserProfile(req, res, next) {
    const userId = req.userData.userId
    if (req.params.userId != userId) {
        throw  new HttpError('Authentication failed', 401)
    }
    try {
        let user = await User.findOne({_id: userId})
        res.status(200).json(user)
    }catch(error){
        throw new HttpError(error, 500)
    }
}

async function updateUserProfile(req, res, next) {
    const userId = req.params.userId 
    const {site} = req.body
    if (req.params.userId != req.params.userId) {
        throw  new HttpError('Authentication failed', 401)
    }
    try {
        let user = await User.findOne({_id: userId})
        console.log("user is", user)
        if (site) {
            user.site = site
        }
        user.save().then((savedUser) => res.status(200).json(savedUser))
    }catch(error){
        throw new HttpError(error, 500)
    }
}

usersRouter.post('/signup', signup) //todo 增加参数检查
usersRouter.post('/login', login)
usersRouter.use(checkAuth)
usersRouter.get('/:userId', getUserProfile)
usersRouter.patch('/:userId', updateUserProfile)
module.exports = usersRouter