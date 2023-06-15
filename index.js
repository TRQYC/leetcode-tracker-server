const express = require('express')
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser');
const exerciseRouter = require('./controllers/exercise_records')
const usersRouter = require('./controllers/users-controllers')
const app = express()
const PORT = process.env.PORT

const mongoose = require('mongoose');
const checkAuth = require('./middleware/check-auth');
const error = require('./middleware/error');
const logger = require('./middleware/log');
const HttpError = require('./models/http_error');
require('dotenv').config()
const password = process.env.PASSWORD

const url =
  `mongodb+srv://leetcode:${password}@cluster0.nezrbgk.mongodb.net/?retryWrites=true&w=majority`
console.log(url, password)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
//before 
app.get('/', (request, response) => {
    response.send('<h1> Hello </h1>')
})
app.use(logger)

app.use('/api/users', usersRouter)
app.use('/api/exercise_records', exerciseRouter)
app.use(error)

//after 
// app.use((req, res, next) => {
//     console.log('哈哈Could not find this route.', req.method, req.url);
//     res.status(404).send('')
// })


mongoose.connect(url, {
    connectTimeoutMS: 30000,
  }).then(() => {
    mongoose.set('debug', true);
    console.log("moongose connected successfully")
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
  }).catch(err => console.log("moongose connect fail", err))
    




