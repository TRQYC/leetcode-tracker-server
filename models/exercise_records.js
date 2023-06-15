

const mongoose = require('mongoose')

const exerciseLogSchema = new mongoose.Schema({
  submissionID:String,
  lang: String, 
  exerciseResult: String, 
}, {timestamps: true})


exerciseLogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


const exerciseSchema = new mongoose.Schema({
  userID: String,
  questionID: String,
  masterLevel: Number, 
  rating: Number,
  tags: [String], // tags list 
  note: String, 
  exerciseLogs:[exerciseLogSchema]
}, { timestamps: true })

exerciseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const ExerciseModel = mongoose.model('Exercise', exerciseSchema)

module.exports = ExerciseModel