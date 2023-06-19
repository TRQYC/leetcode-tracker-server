

const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
  submissionID:String,
  lang: String, 
  exerciseResult: String, 
}, {timestamps: true})


submissionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


const practiceSchema = new mongoose.Schema({
  userId: String,
  questionId: String,
  review: String, 
  translatedTitle: String,
  lastSubmittedAt: Number, 
  proficiency: Number, 
  rating: Number,
  tags: [String], // tags list 
  note: String, 
  status: String, 
  numSubmitted: Number, 
  submissionList:[submissionSchema]
}, { timestamps: true })

practiceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const PracticeModel = mongoose.model('Practices', practiceSchema)

module.exports = PracticeModel