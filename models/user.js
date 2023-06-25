const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String, 
  email: String,
  passwordHash: String,
  site: String, // leetcodeSite
  syncConfig: {
    site: String, 
    leetSession: String, 
  }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.userId = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User