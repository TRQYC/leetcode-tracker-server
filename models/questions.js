const mongoose = require('mongoose')


const questionSchema = new mongoose.Schema({
    frontendQuestionId: String,
    title: String, 
    paidOnly: Boolean, 
    titleSlug: String, 
    difficulty: String, 
    topicTags: [
        {
            name: String, 
            slug: String, 
        }
    ]
})

questionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.questionId = returnedObject.frontendQuestionId
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const Question = mongoose.model('Question', questionSchema)

module.exports = Question