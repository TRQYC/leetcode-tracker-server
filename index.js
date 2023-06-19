const express = require('express')
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser');
const practiceRouter = require('./controllers/practice/practice_controllers')
const usersRouter = require('./controllers/users-controllers')
const app = express()
const PORT = process.env.PORT

const mongoose = require('mongoose');
const checkAuth = require('./middleware/check-auth');
const error = require('./middleware/error');
const logger = require('./middleware/log');
const HttpError = require('./models/http_error');
const dailyReviewHandler = require('./controllers/practice/daily_review_controller');
require('dotenv').config()
const password = process.env.PASSWORD

const url =
  `mongodb+srv://leetcode:${password}@cluster0.nezrbgk.mongodb.net/?retryWrites=true&w=majority`
  process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack)
  });
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
//before 
app.get('/', (request, response) => {
    response.send('<h1> Hello </h1>')
})
app.use(logger)

app.use('/api/users', usersRouter)
app.use('/api/practice', practiceRouter)
app.use('/api/daily_review', dailyReviewHandler)
app.use(error)

mongoose.connect(url, {
    connectTimeoutMS: 30000,
  }).then(() => {
    mongoose.set('debug', true);
    console.log("moongose connected successfully")
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
  }).catch(err => console.log("moongose connect fail", err))
    




