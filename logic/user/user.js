const User = require("../../models/user")



async function getUser(userId) {
    let user = await User.findOne({_id: userId})
    //todo 更优雅
    return user.toJSON()
    
}

module.exports = {
    getUser: getUser
}