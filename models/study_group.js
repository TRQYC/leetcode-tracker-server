const mongoose = require('mongoose')


const groupSchema = new mongoose.Schema({
    memberUserIds: [String],
    title: String
})

module.exports = groupSchema 