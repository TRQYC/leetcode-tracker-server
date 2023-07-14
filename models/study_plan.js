const mongoose = require('mongoose')


const studyPatternSchema = new mongoose.Schema({
    name: String, 
    questionIds: [String],
})

const studyPlanSchema = new mongoose.Schema({
    name: String, 
    creatorUserId: String,
    visibility: String, 
    description: String,
    patterns: [studyPatternSchema]
})

studyPlanSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
const StudyPlanModel = mongoose.model('study_plans', studyPlanSchema)
module.exports = StudyPlanModel 
