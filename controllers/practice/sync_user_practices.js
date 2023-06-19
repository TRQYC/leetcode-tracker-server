const syncUserQuestionsProxy = require("../../logic/practice/sync_user_practiced_questions");
const User = require("../../models/user");

const syncUserPracticeHandler = async (request, response, next) => {
    const userId = request.userData.userId
    try {
        let user = await User.findOne({_id: userId})
        //todo 更优雅
        await syncUserQuestionsProxy(user.toJSON(), true)
    }catch (error) {
        return next(error)
    }
    response.status(200).end()
}

module.exports = syncUserPracticeHandler
//syncUser("647430bdfa4e0361da584678", session);
